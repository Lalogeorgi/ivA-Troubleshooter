import { Module } from '@nestjs/common';
import { TroubleshootingService } from './troubleshooting.service';
import { TroubleshootingEngineService } from './troubleshooting-engine.service';
import { TroubleshootingController } from './troubleshooting.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TroubleshootingController],
  providers: [TroubleshootingService, TroubleshootingEngineService],
  exports: [TroubleshootingService, TroubleshootingEngineService],
})
export class TroubleshootingModule {}
