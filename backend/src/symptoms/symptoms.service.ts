import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';

@Injectable()
export class SymptomsService {
  constructor(private prisma: PrismaService) {}

  async create(createSymptomDto: CreateSymptomDto) {
    return this.prisma.symptom.create({
      data: createSymptomDto as any,
    });
  }

  async findAll(instrumentId?: string) {
    return this.prisma.symptom.findMany({
      where: instrumentId ? { instrumentId } : undefined,
      include: {
        instrument: true,
      },
    });
  }

  async findOne(id: string) {
    const symptom = await this.prisma.symptom.findUnique({
      where: { id },
      include: {
        instrument: true,
        procedures: {
          include: {
            procedure: true,
          },
        },
      },
    });
    if (!symptom) {
      throw new NotFoundException(`Symptom with ID ${id} not found`);
    }
    return symptom;
  }

  async update(id: string, updateSymptomDto: UpdateSymptomDto) {
    return this.prisma.symptom.update({
      where: { id },
      data: updateSymptomDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.symptom.delete({
      where: { id },
    });
  }
}
