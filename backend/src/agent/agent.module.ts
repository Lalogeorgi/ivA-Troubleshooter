import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OntologyModule } from '../ontology/ontology.module';
import { VaultModule } from '../vault/vault.module';
import { DocumentsModule } from '../knowledge-ingestion/documents.module';
import { KnowledgeSearchModule } from '../knowledge-search/knowledge-search.module';
import { TroubleshootingModule } from '../troubleshooting/troubleshooting.module';

import { MockProvider } from './providers/mock.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmProviderFactory } from './llm-provider.factory';
import { AgentToolsService } from './tools/agent-tools.service';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';

@Module({
  imports: [
    PrismaModule,
    OntologyModule,
    VaultModule,
    DocumentsModule,
    KnowledgeSearchModule,
    TroubleshootingModule,
  ],
  controllers: [AgentController],
  providers: [
    MockProvider,
    OllamaProvider,
    OpenAiProvider,
    LlmProviderFactory,
    AgentToolsService,
    AgentService,
  ],
  exports: [AgentService, AgentToolsService],
})
export class AgentModule {}
