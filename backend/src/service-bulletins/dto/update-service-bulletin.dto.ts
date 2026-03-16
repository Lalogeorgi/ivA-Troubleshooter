import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceBulletinDto } from './create-service-bulletin.dto';

export class UpdateServiceBulletinDto extends PartialType(
  CreateServiceBulletinDto,
) {}
