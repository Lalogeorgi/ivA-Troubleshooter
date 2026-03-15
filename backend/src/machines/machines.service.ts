import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async upsert(createMachineDto: CreateMachineDto) {
    const { instrumentId, serialNumber, firmwareVersion, moduleIds } = createMachineDto;

    // Verify instrument exists
    const instrument = await this.prisma.instrument.findUnique({
      where: { id: instrumentId },
    });
    if (!instrument) {
      throw new NotFoundException(`Instrument with ID ${instrumentId} not found`);
    }

    // Upsert machine based on serial number
    const machine = await this.prisma.machine.upsert({
      where: { serialNumber },
      update: {
        firmwareVersion,
        instrumentId,
      },
      create: {
        serialNumber,
        firmwareVersion,
        instrumentId,
      },
    });

    // Handle modules (sync the machine modules)
    if (moduleIds && moduleIds.length > 0) {
      // Simple approach: delete all current modules and add new ones
      await this.prisma.machineModule.deleteMany({
        where: { machineId: machine.id },
      });

      await this.prisma.machineModule.createMany({
        data: moduleIds.map((moduleId) => ({
          machineId: machine.id,
          moduleId,
        })),
      });
    }

    return this.prisma.machine.findUnique({
      where: { id: machine.id },
      include: {
        instrument: true,
        modules: {
          include: {
            module: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        instrument: true,
        modules: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }
}
