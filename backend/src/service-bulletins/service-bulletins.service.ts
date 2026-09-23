import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceBulletinDto } from './dto/create-service-bulletin.dto';
import { UpdateServiceBulletinDto } from './dto/update-service-bulletin.dto';

@Injectable()
export class ServiceBulletinsService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceBulletinDto: CreateServiceBulletinDto) {
    return this.prisma.serviceBulletin.create({
      data: createServiceBulletinDto as any,
    });
  }

  async findAll(instrumentId?: string) {
    return this.prisma.serviceBulletin.findMany({
      where: instrumentId ? { instrumentId } : undefined,
      include: {
        instrument: true,
        procedures: {
          include: {
            procedure: true,
          },
        },
      },
      orderBy: { releaseDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const bulletin = await this.prisma.serviceBulletin.findUnique({
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
    if (!bulletin) {
      throw new NotFoundException(`Service Bulletin with ID ${id} not found`);
    }
    return bulletin;
  }

  async update(id: string, updateServiceBulletinDto: UpdateServiceBulletinDto) {
    return this.prisma.serviceBulletin.update({
      where: { id },
      data: updateServiceBulletinDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.serviceBulletin.delete({
      where: { id },
    });
  }
}
