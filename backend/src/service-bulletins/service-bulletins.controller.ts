import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiceBulletinsService } from './service-bulletins.service';
import { CreateServiceBulletinDto } from './dto/create-service-bulletin.dto';
import { UpdateServiceBulletinDto } from './dto/update-service-bulletin.dto';

@Controller('service-bulletins')
export class ServiceBulletinsController {
  constructor(
    private readonly serviceBulletinsService: ServiceBulletinsService,
  ) {}

  @Post()
  create(@Body() createServiceBulletinDto: CreateServiceBulletinDto) {
    return this.serviceBulletinsService.create(createServiceBulletinDto);
  }

  @Get()
  findAll() {
    return this.serviceBulletinsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceBulletinsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceBulletinDto: UpdateServiceBulletinDto,
  ) {
    return this.serviceBulletinsService.update(+id, updateServiceBulletinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceBulletinsService.remove(+id);
  }
}
