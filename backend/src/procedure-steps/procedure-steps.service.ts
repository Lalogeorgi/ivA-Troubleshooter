import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcedureStepDto } from './dto/create-procedure-step.dto';
import { UpdateProcedureStepDto } from './dto/update-procedure-step.dto';

@Injectable()
export class ProcedureStepsService {
  constructor(private prisma: PrismaService) {}

  async create(createProcedureStepDto: CreateProcedureStepDto) {
    return this.prisma.procedureStep.create({
      data: createProcedureStepDto as any,
    });
  }

  async findAll(procedureId?: string) {
    return this.prisma.procedureStep.findMany({
      where: procedureId ? { procedureId } : undefined,
      include: {
        referenceDocument: true,
      },
      orderBy: { stepNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const step = await this.prisma.procedureStep.findUnique({
      where: { id },
      include: {
        referenceDocument: true,
      },
    });
    if (!step) {
      throw new NotFoundException(`Procedure step with ID ${id} not found`);
    }
    return step;
  }

  async update(id: string, updateProcedureStepDto: UpdateProcedureStepDto) {
    return this.prisma.procedureStep.update({
      where: { id },
      data: updateProcedureStepDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.procedureStep.delete({
      where: { id },
    });
  }
}
