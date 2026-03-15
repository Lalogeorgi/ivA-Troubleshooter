import { Module } from '@nestjs/common';
import { ProcedureStepsService } from './procedure-steps.service';
import { ProcedureStepsController } from './procedure-steps.controller';

@Module({
  controllers: [ProcedureStepsController],
  providers: [ProcedureStepsService],
})
export class ProcedureStepsModule {}
