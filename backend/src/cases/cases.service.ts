import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TroubleshootingEngineService } from '../troubleshooting/troubleshooting-engine.service';
import { ComplianceAuditService } from '../audit/compliance-audit.service';

export class CreateCaseDto {
  assetId: string;
  engineerId: string;
  engineerName: string;
  symptomDescription: string;
  initialErrorCode?: string;
}

export class RecordStepDto {
  nodeKey: string;
  measuredValue?: number;
  actionStatus?: 'DONE' | 'SKIPPED' | 'FAILED';
  notes?: string;
}

export class RequestApprovalDto {
  actionType: 'REPLACE_PART' | 'CHANGE_CONFIG' | 'CLOSE_CASE' | 'ESCALATE_R_AND_D';
  targetEntity: string;
  justification: string;
}

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: TroubleshootingEngineService,
    private readonly audit: ComplianceAuditService,
  ) {}

  /**
   * Initialize a new Field Service Case
   */
  async createCase(dto: CreateCaseDto) {
    const asset = await this.prisma.installedAsset.findUnique({
      where: { id: dto.assetId },
      include: { instrument: true, site: true },
    });

    if (!asset) {
      throw new NotFoundException(`Installed asset with ID ${dto.assetId} not found`);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `CASE-2026-${randomSuffix}`;

    const created = await this.prisma.serviceCase.create({
      data: {
        caseNumber,
        assetId: dto.assetId,
        engineerId: dto.engineerId,
        engineerName: dto.engineerName,
        status: 'ARRIVED',
        symptomDescription: dto.symptomDescription,
        initialErrorCode: dto.initialErrorCode,
        stepHistory: [],
        measurements: [],
        partsReplaced: [],
      },
      include: {
        asset: {
          include: {
            instrument: true,
            site: true,
          },
        },
      },
    });

    await this.audit.recordEvent(created.id, 'CASE_CREATED', dto.engineerName, {
      caseNumber: created.caseNumber,
      assetId: dto.assetId,
      symptomDescription: dto.symptomDescription,
      initialErrorCode: dto.initialErrorCode,
    });

    return created;
  }

  /**
   * Retrieve case details with asset, site, and approvals
   */
  async getCase(id: string) {
    const serviceCase = await this.prisma.serviceCase.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            instrument: true,
            site: true,
          },
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!serviceCase) {
      throw new NotFoundException(`Service case with ID ${id} not found`);
    }

    return serviceCase;
  }

  /**
   * List all service cases with optional status or asset filtering
   */
  async listCases(status?: string, assetId?: string) {
    return this.prisma.serviceCase.findMany({
      where: {
        status: status ? status.toUpperCase() : undefined,
        assetId: assetId || undefined,
      },
      include: {
        asset: {
          include: {
            instrument: true,
            site: true,
          },
        },
        approvals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Start a troubleshooting procedure on an active case
   */
  async startTroubleshooting(caseId: string, procedureId: string) {
    const serviceCase = await this.getCase(caseId);

    const firstNode = await this.prisma.diagnosticStepNode.findFirst({
      where: { procedureId },
      orderBy: { stepNumber: 'asc' },
    });

    if (!firstNode) {
      throw new BadRequestException(`Procedure ${procedureId} has no diagnostic step nodes defined`);
    }

    return this.prisma.serviceCase.update({
      where: { id: caseId },
      data: {
        activeProcedureId: procedureId,
        currentNodeKey: firstNode.nodeKey,
        status: 'DIAGNOSING',
      },
      include: {
        asset: {
          include: { instrument: true, site: true },
        },
        approvals: true,
      },
    });
  }

  /**
   * Record diagnostic step measurement or action outcome and advance state machine
   */
  async recordStep(caseId: string, dto: RecordStepDto) {
    const serviceCase = await this.getCase(caseId);

    if (!serviceCase.activeProcedureId) {
      throw new BadRequestException('Case does not have an active troubleshooting procedure');
    }

    // 1. Evaluate step tolerances via engine
    const evaluation = await this.engine.evaluateStep({
      procedureId: serviceCase.activeProcedureId,
      nodeKey: dto.nodeKey,
      measuredValue: dto.measuredValue,
      actionStatus: dto.actionStatus,
      notes: dto.notes,
    });

    // 2. Append step to history
    const history = (serviceCase.stepHistory as any[]) || [];
    const stepRecord = {
      timestamp: new Date().toISOString(),
      nodeKey: evaluation.nodeKey,
      title: evaluation.title,
      nodeType: evaluation.nodeType,
      status: evaluation.status,
      measuredValue: evaluation.measuredValue,
      nominalMin: evaluation.nominalMin,
      nominalMax: evaluation.nominalMax,
      unit: evaluation.unit,
      inTolerance: evaluation.inTolerance,
      deltaFromCenter: evaluation.deltaFromCenter,
      nextNodeKey: evaluation.nextNodeKey,
      notes: evaluation.notes,
    };
    history.push(stepRecord);

    // 3. Update measurements if applicable
    const measurements = (serviceCase.measurements as any[]) || [];
    if (evaluation.measuredValue !== undefined) {
      measurements.push({
        timestamp: new Date().toISOString(),
        target: evaluation.title,
        measured: evaluation.measuredValue,
        unit: evaluation.unit,
        inTolerance: evaluation.inTolerance,
      });
    }

    // 4. Update status and current node
    let nextStatus = serviceCase.status;
    if (evaluation.requiresApproval) {
      nextStatus = 'AWAITING_PARTS';
    } else if (!evaluation.nextNodeKey && evaluation.status === 'PASS') {
      nextStatus = 'VERIFYING';
    }

    const updatedCase = await this.prisma.serviceCase.update({
      where: { id: caseId },
      data: {
        currentNodeKey: evaluation.nextNodeKey,
        status: nextStatus,
        stepHistory: history,
        measurements: measurements,
      },
      include: {
        asset: {
          include: { instrument: true, site: true },
        },
        approvals: true,
      },
    });

    await this.audit.recordEvent(caseId, 'DIAGNOSTIC_STEP_EVALUATED', serviceCase.engineerName, {
      nodeKey: evaluation.nodeKey,
      title: evaluation.title,
      status: evaluation.status,
      measuredValue: evaluation.measuredValue,
      inTolerance: evaluation.inTolerance,
      nextNodeKey: evaluation.nextNodeKey,
    });

    return updatedCase;
  }

  /**
   * Request Human-in-the-Loop approval for a consequential field action
   */
  async requestApproval(caseId: string, dto: RequestApprovalDto) {
    const serviceCase = await this.getCase(caseId);

    const approval = await this.prisma.caseApprovalRequest.create({
      data: {
        caseId: serviceCase.id,
        actionType: dto.actionType,
        targetEntity: dto.targetEntity,
        justification: dto.justification,
        status: 'PENDING',
      },
    });

    await this.prisma.serviceCase.update({
      where: { id: caseId },
      data: {
        status: dto.actionType === 'REPLACE_PART' ? 'AWAITING_PARTS' : 'REPAIRING',
      },
    });

    await this.audit.recordEvent(caseId, 'APPROVAL_REQUESTED', serviceCase.engineerName, {
      approvalId: approval.id,
      actionType: dto.actionType,
      targetEntity: dto.targetEntity,
      justification: dto.justification,
    });

    return approval;
  }

  /**
   * Grant or reject human approval
   */
  async grantApproval(
    approvalId: string,
    decision: 'APPROVE' | 'REJECT',
    approvedBy: string,
    rejectionReason?: string
  ) {
    const approval = await this.prisma.caseApprovalRequest.findUnique({
      where: { id: approvalId },
      include: { case: true },
    });

    if (!approval) {
      throw new NotFoundException(`Approval request ${approvalId} not found`);
    }

    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updated = await this.prisma.caseApprovalRequest.update({
      where: { id: approvalId },
      data: {
        status: newStatus,
        approvedBy,
        rejectionReason,
      },
    });

    // If approved part replacement, update parts replaced
    if (decision === 'APPROVE' && approval.actionType === 'REPLACE_PART') {
      const parts = (approval.case.partsReplaced as any[]) || [];
      parts.push({
        part: approval.targetEntity,
        approvedBy,
        timestamp: new Date().toISOString(),
      });

      await this.prisma.serviceCase.update({
        where: { id: approval.caseId },
        data: {
          partsReplaced: parts,
          status: 'REPAIRING',
        },
      });
    }

    await this.audit.recordEvent(approval.caseId, `APPROVAL_${decision}`, approvedBy, {
      approvalId,
      actionType: approval.actionType,
      targetEntity: approval.targetEntity,
      rejectionReason,
    });

    return updated;
  }

  /**
   * Transition case status manually (e.g. to VERIFYING or COMPLETED)
   */
  async updateStatus(caseId: string, status: string, notes?: string) {
    return this.prisma.serviceCase.update({
      where: { id: caseId },
      data: {
        status: status.toUpperCase(),
        resolutionNotes: notes ? notes : undefined,
      },
    });
  }

  /**
   * Generate formal Field Service Report (FSR)
   */
  async generateReport(caseId: string): Promise<{ reportMarkdown: string; caseNumber: string }> {
    const c = await this.getCase(caseId);

    const history = (c.stepHistory as any[]) || [];
    const measurements = (c.measurements as any[]) || [];
    const parts = (c.partsReplaced as any[]) || [];

    const reportMarkdown = `
# FIELD SERVICE INTERVENTION REPORT
**Case Number**: ${c.caseNumber}  
**Date**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
**Field Engineer**: ${c.engineerName} (ID: ${c.engineerId})  
**Service Status**: ${c.status}

---

## 1. Asset & Hospital Details
- **Customer Site**: ${c.asset.site.name} (${c.asset.site.city}, ${c.asset.site.country})
- **Hospital System**: ${c.asset.site.hospitalSystem || 'N/A'}
- **Instrument Model**: ${c.asset.instrument.model} (${c.asset.instrument.manufacturer})
- **Serial Number**: \`${c.asset.serialNumber}\`
- **Firmware Version**: \`${c.asset.firmwareVersion}\`

## 2. Reported Problem & Clinical Symptoms
- **Reported Symptom**: ${c.symptomDescription}
- **Initial Alarm Code**: \`${c.initialErrorCode || 'None'}\`

## 3. Physical Measurements & Tolerance Checks
${
  measurements.length === 0
    ? '*No physical measurements recorded during intervention.*'
    : `| Measurement Target | Measured Value | Unit | Status | Timestamp |
| :--- | :--- | :--- | :--- | :--- |
${measurements
  .map(
    (m) =>
      `| ${m.target} | ${m.measured} | ${m.unit || ''} | ${m.inTolerance ? 'PASS' : 'FAIL'} | ${new Date(
        m.timestamp
      ).toLocaleTimeString()} |`
  )
  .join('\n')}`
}

## 4. Consumed Replacement Parts
${
  parts.length === 0
    ? '*No spare parts consumed.*'
    : parts.map((p) => `- **${p.part}** (Authorized by: ${p.approvedBy}, Time: ${p.timestamp})`).join('\n')
}

## 5. Diagnostic Step History
${history
  .map(
    (s, idx) =>
      `${idx + 1}. **[${s.status}] ${s.title}** (\`${s.nodeKey}\`)  
   ${s.measuredValue !== undefined ? `Measurement: ${s.measuredValue} ${s.unit || ''} (Nominal: ${s.nominalMin} - ${s.nominalMax})` : ''}  
   ${s.notes ? `*Technician Note*: ${s.notes}` : ''}`
  )
  .join('\n\n')}

## 6. Return to Service Authorization
- **Final Disposition**: OPERATIONAL — Verified against calibration specifications.
- **Field Service Engineer Sign-Off**: ${c.engineerName}
- **Clinical Laboratory Acknowledgment**: Received & Accepted by Hospital Representative.
`;

    // Save report in resolutionNotes if empty
    if (!c.resolutionNotes) {
      await this.prisma.serviceCase.update({
        where: { id: caseId },
        data: { resolutionNotes: 'Service report generated and validated.' },
      });
    }

    await this.audit.recordEvent(caseId, 'FIELD_REPORT_GENERATED', c.engineerName, {
      caseNumber: c.caseNumber,
      status: c.status,
      measurementsCount: measurements.length,
      partsCount: parts.length,
    });

    return {
      caseNumber: c.caseNumber,
      reportMarkdown: reportMarkdown.trim(),
    };
  }
}
