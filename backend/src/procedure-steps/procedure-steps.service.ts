import { Injectable } from '@nestjs/common';
import { CreateProcedureStepDto } from './dto/create-procedure-step.dto';
import { UpdateProcedureStepDto } from './dto/update-procedure-step.dto';

@Injectable()
export class ProcedureStepsService {
  create(createProcedureStepDto: CreateProcedureStepDto) {
    return 'This action adds a new procedureStep';
  }

  findAll() {
    return `This action returns all procedureSteps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} procedureStep`;
  }

  update(id: number, updateProcedureStepDto: UpdateProcedureStepDto) {
    return `This action updates a #${id} procedureStep`;
  }

  remove(id: number) {
    return `This action removes a #${id} procedureStep`;
  }
}
