import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { TroubleshootingService } from './troubleshooting.service';
import { TroubleshootingEngineService, EvaluateStepInput } from './troubleshooting-engine.service';

export class EvaluateStepDto {
  procedureId: string;
  nodeKey: string;
  measuredValue?: number;
  actionStatus?: 'DONE' | 'SKIPPED' | 'FAILED';
  notes?: string;
}

@Controller(['troubleshooting', 'api/v1/troubleshooting'])
export class TroubleshootingController {
  constructor(
    private readonly troubleshootingService: TroubleshootingService,
    private readonly engineService: TroubleshootingEngineService,
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

  @Get('tree/:procedureId')
  async getProcedureTree(@Param('procedureId') procedureId: string) {
    return this.engineService.getProcedureTree(procedureId);
  }

  @Post('evaluate-step')
  async evaluateStep(@Body() dto: EvaluateStepDto) {
    return this.engineService.evaluateStep(dto);
  }
}
