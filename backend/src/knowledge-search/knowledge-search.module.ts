import { Module } from '@nestjs/common';
import { KnowledgeSearchService } from './knowledge-search.service';
import { HybridSearchService } from './hybrid-search.service';
import { GraphTraversalService } from './graph-traversal.service';
import { KnowledgeSearchController } from './knowledge-search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KnowledgeSearchController],
  providers: [KnowledgeSearchService, HybridSearchService, GraphTraversalService],
  exports: [KnowledgeSearchService, HybridSearchService, GraphTraversalService],
})
export class KnowledgeSearchModule {}
