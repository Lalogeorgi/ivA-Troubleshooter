import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstrumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.instrument.findMany();
  }

  async findOne(id: string) {
    const instrument = await this.prisma.instrument.findUnique({
      where: { id },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument with ID ${id} not found`);
    }

    return instrument;
  }
}
