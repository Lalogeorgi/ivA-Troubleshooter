import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProceduresService {
  constructor(private prisma: PrismaService) {}

  create(createProcedureDto: CreateProcedureDto) {
    return 'This action adds a new procedure';
  }

  findAll() {
    return this.prisma.procedure.findMany();
  }

  async findOne(id: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }

    return procedure;
  }

  update(id: string, updateProcedureDto: UpdateProcedureDto) {
    return `This action updates a #${id} procedure`;
  }

  remove(id: string) {
    return `This action removes a #${id} procedure`;
  }
}
