import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { VaultService } from './vault.service';

@Controller(['vault', 'api/v1/vault'])
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('sync')
  sync() {
    return this.vaultService.syncVault();
  }

  @Get('graph')
  getGraph() {
    return this.vaultService.getGraph();
  }

  @Get('entities')
  listEntities(@Query('category') category?: string) {
    return this.vaultService.listEntities(category);
  }

  @Get('entities/:id')
  getEntity(@Param('id') id: string) {
    return this.vaultService.getEntity(id);
  }
}
