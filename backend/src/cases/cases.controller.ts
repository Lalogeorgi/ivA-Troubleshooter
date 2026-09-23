import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CasesService, CreateCaseDto, RecordStepDto, RequestApprovalDto } from './cases.service';

export class GrantApprovalDto {
  decision: 'APPROVE' | 'REJECT';
  approvedBy: string;
  rejectionReason?: string;
}

export class UpdateStatusDto {
  status: string;
  notes?: string;
}

export class StartTroubleshootingDto {
  procedureId: string;
}

@Controller(['cases', 'api/v1/cases'])
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  createCase(@Body() dto: CreateCaseDto) {
    return this.casesService.createCase(dto);
  }

  @Get()
  listCases(
    @Query('status') status?: string,
    @Query('assetId') assetId?: string,
  ) {
    return this.casesService.listCases(status, assetId);
  }

  @Get(':id')
  getCase(@Param('id') id: string) {
    return this.casesService.getCase(id);
  }

  @Post(':id/start-troubleshooting')
  startTroubleshooting(
    @Param('id') id: string,
    @Body() dto: StartTroubleshootingDto,
  ) {
    return this.casesService.startTroubleshooting(id, dto.procedureId);
  }

  @Post(':id/step')
  recordStep(@Param('id') id: string, @Body() dto: RecordStepDto) {
    return this.casesService.recordStep(id, dto);
  }

  @Post(':id/approvals')
  requestApproval(@Param('id') id: string, @Body() dto: RequestApprovalDto) {
    return this.casesService.requestApproval(id, dto);
  }

  @Patch('approvals/:approvalId')
  grantApproval(
    @Param('approvalId') approvalId: string,
    @Body() dto: GrantApprovalDto,
  ) {
    return this.casesService.grantApproval(
      approvalId,
      dto.decision,
      dto.approvedBy,
      dto.rejectionReason,
    );
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.casesService.updateStatus(id, dto.status, dto.notes);
  }

  @Post(':id/generate-report')
  generateReport(@Param('id') id: string) {
    return this.casesService.generateReport(id);
  }
}
