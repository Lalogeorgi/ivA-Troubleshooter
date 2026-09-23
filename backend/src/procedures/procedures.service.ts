import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProceduresService {
  constructor(private prisma: PrismaService) {}

  async create(createProcedureDto: CreateProcedureDto) {
    return this.prisma.procedure.create({
      data: createProcedureDto as any,
    });
  }

  async findAll(instrumentId?: string) {
    return this.prisma.procedure.findMany({
      where: instrumentId ? { instrumentId } : undefined,
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
          include: {
            referenceDocument: true,
          },
        },
        errorCodes: {
          include: {
            errorCode: true,
          },
        },
        symptoms: {
          include: {
            symptom: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id },
      include: {
        instrument: true,
        steps: {
          orderBy: { stepNumber: 'asc' },
          include: {
            referenceDocument: true,
          },
        },
        errorCodes: {
          include: {
            errorCode: true,
          },
        },
        symptoms: {
          include: {
            symptom: true,
          },
        },
        serviceBulletins: {
          include: {
            serviceBulletin: true,
          },
        },
      },
    });

    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }

    return procedure;
  }

  async update(id: string, updateProcedureDto: UpdateProcedureDto) {
    return this.prisma.procedure.update({
      where: { id },
      data: updateProcedureDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.procedure.delete({
      where: { id },
    });
  }
}
