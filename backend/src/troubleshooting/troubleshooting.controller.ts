import { Controller, Get, Query } from '@nestjs/common';
import { TroubleshootingService } from './troubleshooting.service';

@Controller('troubleshooting')
export class TroubleshootingController {
  constructor(
    private readonly troubleshootingService: TroubleshootingService,
  ) {}

  @Get()
  async getTroubleshooting(
    @Query('instrument_id') instrumentId: string,
    @Query('firmware_version') firmwareVersion: string,
    @Query('error_code') errorCode?: string,
    @Query('symptom') symptom?: string,
  ) {
    return this.troubleshootingService.getProcedures({
      instrumentId,
      firmwareVersion,
      errorCode,
      symptom,
    });
  }
}
