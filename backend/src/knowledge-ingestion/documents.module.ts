import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProvenanceIndexer } from './provenance-indexer';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [ProvenanceIndexer, DocumentsService],
  exports: [DocumentsService, ProvenanceIndexer],
})
export class DocumentsModule {}
