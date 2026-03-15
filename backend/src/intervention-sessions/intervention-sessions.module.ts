import { Module } from '@nestjs/common';
import { InterventionSessionsController } from './intervention-sessions.controller';
import { InterventionSessionsService } from './intervention-sessions.service';

@Module({
  controllers: [InterventionSessionsController],
  providers: [InterventionSessionsService]
})
export class InterventionSessionsModule {}
