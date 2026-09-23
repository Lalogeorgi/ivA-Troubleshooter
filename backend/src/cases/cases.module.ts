import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TroubleshootingModule } from '../troubleshooting/troubleshooting.module';
import { AuditModule } from '../audit/audit.module';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';

@Module({
  imports: [PrismaModule, TroubleshootingModule, AuditModule],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
