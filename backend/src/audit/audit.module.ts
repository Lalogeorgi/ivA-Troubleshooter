import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceAuditService } from './compliance-audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [ComplianceAuditService],
  exports: [ComplianceAuditService],
})
export class AuditModule {}
