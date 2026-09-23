import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ComplianceAuditService } from './compliance-audit.service';

@Controller(['audit', 'api/v1/audit'])
export class AuditController {
  constructor(private readonly auditService: ComplianceAuditService) {}

  @Get('trail')
  getAuditTrail(@Query('caseId') caseId?: string) {
    return this.auditService.getAuditTrail(caseId);
  }

  @Get('verify')
  verifyChainIntegrity() {
    return this.auditService.verifyChainIntegrity();
  }
}
