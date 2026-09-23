import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OfflinePackagerService } from './offline-packager.service';
import { OfflineController } from './offline.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OfflineController],
  providers: [OfflinePackagerService],
  exports: [OfflinePackagerService],
})
export class OfflineModule {}
