import { Module } from '@nestjs/common';
import { ServiceBulletinsService } from './service-bulletins.service';
import { ServiceBulletinsController } from './service-bulletins.controller';

@Module({
  controllers: [ServiceBulletinsController],
  providers: [ServiceBulletinsService],
})
export class ServiceBulletinsModule {}
