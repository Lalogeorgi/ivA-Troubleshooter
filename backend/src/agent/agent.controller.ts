import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentToolsService } from './tools/agent-tools.service';

export class DiagnoseDto {
  prompt: string;
  sessionId?: string;
  instrumentId?: string;
  serialNumber?: string;
  firmwareVersion?: string;
}

@Controller(['agent', 'api/v1/agent'])
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly toolsService: AgentToolsService,
  ) {}

  @Post('diagnose')
  diagnose(@Body() body: DiagnoseDto) {
    return this.agentService.diagnose(body);
  }

  @Get('tools')
  getTools() {
    return this.toolsService.getAvailableTools();
  }

  @Get('traces')
  getTraces(
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.agentService.getTraces(sessionId, parsedLimit);
  }

  @Get('traces/:id')
  getTrace(@Param('id') id: string) {
    return this.agentService.getTrace(id);
  }
}
