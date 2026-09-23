import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateErrorCodeDto } from './dto/create-error-code.dto';
import { UpdateErrorCodeDto } from './dto/update-error-code.dto';

@Injectable()
export class ErrorCodesService {
  constructor(private prisma: PrismaService) {}

  async create(createErrorCodeDto: CreateErrorCodeDto) {
    return this.prisma.errorCode.create({
      data: createErrorCodeDto as any,
    });
  }

  async findAll(instrumentId?: string) {
    return this.prisma.errorCode.findMany({
      where: instrumentId ? { instrumentId } : undefined,
      include: {
        instrument: true,
      },
    });
  }

  async findOne(id: string) {
    const code = await this.prisma.errorCode.findUnique({
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
    if (!code) {
      throw new NotFoundException(`Error code with ID ${id} not found`);
    }
    return code;
  }

  async update(id: string, updateErrorCodeDto: UpdateErrorCodeDto) {
    return this.prisma.errorCode.update({
      where: { id },
      data: updateErrorCodeDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.errorCode.delete({
      where: { id },
    });
  }
}
