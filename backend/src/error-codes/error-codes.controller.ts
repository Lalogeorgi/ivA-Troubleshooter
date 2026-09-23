import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ErrorCodesService } from './error-codes.service';
import { CreateErrorCodeDto } from './dto/create-error-code.dto';
import { UpdateErrorCodeDto } from './dto/update-error-code.dto';

@Controller('error-codes')
export class ErrorCodesController {
  constructor(private readonly errorCodesService: ErrorCodesService) {}

  @Post()
  create(@Body() createErrorCodeDto: CreateErrorCodeDto) {
    return this.errorCodesService.create(createErrorCodeDto);
  }

  @Get()
  findAll(@Param('instrumentId') instrumentId?: string) {
    return this.errorCodesService.findAll(instrumentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.errorCodesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateErrorCodeDto: UpdateErrorCodeDto,
  ) {
    return this.errorCodesService.update(id, updateErrorCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.errorCodesService.remove(id);
  }
}
