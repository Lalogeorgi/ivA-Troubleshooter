import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProcedureStepsService } from './procedure-steps.service';
import { CreateProcedureStepDto } from './dto/create-procedure-step.dto';
import { UpdateProcedureStepDto } from './dto/update-procedure-step.dto';

@Controller('procedure-steps')
export class ProcedureStepsController {
  constructor(private readonly procedureStepsService: ProcedureStepsService) {}

  @Post()
  create(@Body() createProcedureStepDto: CreateProcedureStepDto) {
    return this.procedureStepsService.create(createProcedureStepDto);
  }

  @Get()
  findAll() {
    return this.procedureStepsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.procedureStepsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProcedureStepDto: UpdateProcedureStepDto,
  ) {
    return this.procedureStepsService.update(+id, updateProcedureStepDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.procedureStepsService.remove(+id);
  }
}
