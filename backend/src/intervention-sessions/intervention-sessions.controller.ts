import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InterventionSessionsService } from './intervention-sessions.service';
import { CreateInterventionSessionDto } from './dto/create-intervention-session.dto';

@Controller('intervention-sessions')
export class InterventionSessionsController {
  constructor(private readonly interventionSessionsService: InterventionSessionsService) {}

  @Post()
  create(@Body() createDto: CreateInterventionSessionDto) {
    return this.interventionSessionsService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interventionSessionsService.findOne(id);
  }
}
