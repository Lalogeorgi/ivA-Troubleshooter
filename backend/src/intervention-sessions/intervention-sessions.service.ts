import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterventionSessionDto } from './dto/create-intervention-session.dto';

@Injectable()
export class InterventionSessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateInterventionSessionDto) {
    const { machineId, engineerName, notes } = createDto;

    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    return this.prisma.interventionSession.create({
      data: {
        machineId,
        engineerName,
        notes,
      },
      include: {
        machine: {
          include: {
            instrument: true,
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.interventionSession.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            instrument: true,
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Intervention session with ID ${id} not found`,
      );
    }

    return session;
  }
}
