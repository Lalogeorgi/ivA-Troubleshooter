import { Module } from '@nestjs/common';
import { TroubleshootingService } from './troubleshooting.service';
import { TroubleshootingController } from './troubleshooting.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TroubleshootingController],
  providers: [TroubleshootingService],
})
export class TroubleshootingModule {}
