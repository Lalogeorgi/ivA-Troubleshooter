import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface EvaluateStepInput {
  procedureId: string;
  nodeKey: string;
  measuredValue?: number;
  actionStatus?: 'DONE' | 'SKIPPED' | 'FAILED';
  notes?: string;
}

export interface EvaluateStepResult {
  nodeKey: string;
  nodeType: string;
  title: string;
  status: 'PASS' | 'FAIL' | 'INCOMPLETE';
  measuredValue?: number;
  nominalMin?: number | null;
  nominalMax?: number | null;
  unit?: string | null;
  inTolerance?: boolean;
  deltaFromCenter?: number;
  nextNodeKey?: string | null;
  nextNode?: any | null;
  probableCauseOnFail?: string | null;
  recommendedPart?: string | null;
  requiresApproval: boolean;
  notes?: string;
}

@Injectable()
export class TroubleshootingEngineService {
  private readonly logger = new Logger(TroubleshootingEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve the complete visual decision tree graph for a procedure
   */
  async getProcedureTree(procedureId: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id: procedureId },
      include: {
        stepNodes: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${procedureId} not found`);
    }

    // Build visual graph edges from passNextNodeKey and failNextNodeKey
    const nodes = procedure.stepNodes.map((n) => ({
      key: n.nodeKey,
      title: n.title,
      nodeType: n.nodeType,
      stepNumber: n.stepNumber,
      instruction: n.instruction,
      warning: n.warning,
      requiredTool: n.requiredTool,
      measurementTarget: n.measurementTarget,
      nominalMin: n.nominalMin,
      nominalMax: n.nominalMax,
      unit: n.unit,
      requiresApproval: n.requiresApproval,
      recommendedPart: n.recommendedPart,
    }));

    const edges: Array<{ source: string; target: string; condition: 'PASS' | 'FAIL' }> = [];
    procedure.stepNodes.forEach((n) => {
      if (n.passNextNodeKey) {
        edges.push({ source: n.nodeKey, target: n.passNextNodeKey, condition: 'PASS' });
      }
      if (n.failNextNodeKey) {
        edges.push({ source: n.nodeKey, target: n.failNextNodeKey, condition: 'FAIL' });
      }
    });

    return {
      procedureId: procedure.id,
      title: procedure.title,
      procedureType: procedure.procedureType,
      nodes,
      edges,
    };
  }

  /**
   * Evaluate a diagnostic step measurement or action against engineering tolerances
   */
  async evaluateStep(input: EvaluateStepInput): Promise<EvaluateStepResult> {
    const node = await this.prisma.diagnosticStepNode.findUnique({
      where: {
        procedureId_nodeKey: {
          procedureId: input.procedureId,
          nodeKey: input.nodeKey,
        },
      },
    });

    if (!node) {
      throw new NotFoundException(
        `Step node ${input.nodeKey} for procedure ${input.procedureId} not found`
      );
    }

    let status: 'PASS' | 'FAIL' | 'INCOMPLETE' = 'PASS';
    let inTolerance: boolean | undefined = undefined;
    let deltaFromCenter: number | undefined = undefined;

    // 1. Evaluate Measurements
    if (node.nodeType === 'MEASUREMENT') {
      if (input.measuredValue === undefined || input.measuredValue === null) {
        status = 'INCOMPLETE';
      } else {
        const val = input.measuredValue;
        const minOk = node.nominalMin === null || val >= node.nominalMin;
        const maxOk = node.nominalMax === null || val <= node.nominalMax;

        inTolerance = minOk && maxOk;
        status = inTolerance ? 'PASS' : 'FAIL';

        if (node.nominalMin !== null && node.nominalMax !== null) {
          const center = (node.nominalMin + node.nominalMax) / 2;
          deltaFromCenter = Math.round((val - center) * 1000) / 1000;
        }
      }
    } else {
      // 2. Evaluate Actions, Decisions, Safety Checks
      if (input.actionStatus === 'FAILED') {
        status = 'FAIL';
      } else if (input.actionStatus === 'DONE') {
        status = 'PASS';
      } else {
        status = 'PASS';
      }
    }

    // 3. Determine next node key
    const nextNodeKey = status === 'PASS' ? node.passNextNodeKey : node.failNextNodeKey;

    // 4. Fetch next node details if available
    let nextNode: any = null;
    if (nextNodeKey) {
      nextNode = await this.prisma.diagnosticStepNode.findUnique({
        where: {
          procedureId_nodeKey: {
            procedureId: input.procedureId,
            nodeKey: nextNodeKey,
          },
        },
      });
    }

    return {
      nodeKey: node.nodeKey,
      nodeType: node.nodeType,
      title: node.title,
      status,
      measuredValue: input.measuredValue,
      nominalMin: node.nominalMin,
      nominalMax: node.nominalMax,
      unit: node.unit,
      inTolerance,
      deltaFromCenter,
      nextNodeKey,
      nextNode,
      probableCauseOnFail: node.probableCauseOnFail,
      recommendedPart: node.recommendedPart,
      requiresApproval: nextNode ? nextNode.requiresApproval : false,
      notes: input.notes,
    };
  }
}
