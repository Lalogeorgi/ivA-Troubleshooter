import { Controller, Get, Param, Query } from '@nestjs/common';
import { OntologyService } from './ontology.service';

@Controller('ontology')
export class OntologyController {
  constructor(private readonly ontologyService: OntologyService) {}

  @Get('instruments/:id/tree')
  getInstrumentTree(@Param('id') instrumentId: string) {
    return this.ontologyService.getInstrumentTree(instrumentId);
  }

  @Get('components/:idOrPartNumber')
  getComponent(@Param('idOrPartNumber') idOrPartNumber: string) {
    return this.ontologyService.getComponent(idOrPartNumber);
  }

  @Get('assets/serial/:serialNumber')
  getInstalledAsset(@Param('serialNumber') serialNumber: string) {
    return this.ontologyService.getInstalledAsset(serialNumber);
  }

  @Get('assets')
  listInstalledAssets(@Query('instrumentId') instrumentId?: string) {
    return this.ontologyService.listInstalledAssets(instrumentId);
  }

  @Get('sites')
  listCustomerSites() {
    return this.ontologyService.listCustomerSites();
  }
}
