import { Module } from '@nestjs/common';
import { OntologyService } from './ontology.service';
import { OntologyController } from './ontology.controller';

@Module({
  controllers: [OntologyController],
  providers: [OntologyService],
  exports: [OntologyService],
})
export class OntologyModule {}
