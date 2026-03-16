import { PartialType } from '@nestjs/mapped-types';
import { CreateProcedureStepDto } from './create-procedure-step.dto';

export class UpdateProcedureStepDto extends PartialType(
  CreateProcedureStepDto,
) {}
