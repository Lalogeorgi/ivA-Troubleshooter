import { Module } from '@nestjs/common';
import { KnowledgeSearchService } from './knowledge-search.service';
import { KnowledgeSearchController } from './knowledge-search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KnowledgeSearchController],
  providers: [KnowledgeSearchService],
})
export class KnowledgeSearchModule {}
