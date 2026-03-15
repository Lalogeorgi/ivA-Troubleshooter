import { Injectable } from '@nestjs/common';
import { CreateServiceBulletinDto } from './dto/create-service-bulletin.dto';
import { UpdateServiceBulletinDto } from './dto/update-service-bulletin.dto';

@Injectable()
export class ServiceBulletinsService {
  create(createServiceBulletinDto: CreateServiceBulletinDto) {
    return 'This action adds a new serviceBulletin';
  }

  findAll() {
    return `This action returns all serviceBulletins`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceBulletin`;
  }

  update(id: number, updateServiceBulletinDto: UpdateServiceBulletinDto) {
    return `This action updates a #${id} serviceBulletin`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceBulletin`;
  }
}
