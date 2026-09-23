import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { MachinesModule } from './machines/machines.module';
import { InterventionSessionsModule } from './intervention-sessions/intervention-sessions.module';
import { ModulesModule } from './modules/modules.module';
import { ErrorCodesModule } from './error-codes/error-codes.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { ProceduresModule } from './procedures/procedures.module';
import { ProcedureStepsModule } from './procedure-steps/procedure-steps.module';
import { ServiceBulletinsModule } from './service-bulletins/service-bulletins.module';
import { TroubleshootingModule } from './troubleshooting/troubleshooting.module';
import { KnowledgeSearchModule } from './knowledge-search/knowledge-search.module';
import { OntologyModule } from './ontology/ontology.module';
import { VaultModule } from './vault/vault.module';
import { DocumentsModule } from './knowledge-ingestion/documents.module';
import { AgentModule } from './agent/agent.module';
import { CasesModule } from './cases/cases.module';
import { OfflineModule } from './offline/offline.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    OntologyModule,
    VaultModule,
    DocumentsModule,
    AgentModule,
    CasesModule,
    OfflineModule,
    AuditModule,
    InstrumentsModule,
    MachinesModule,
    InterventionSessionsModule,
    ModulesModule,
    ErrorCodesModule,
    SymptomsModule,
    ProceduresModule,
    ProcedureStepsModule,
    ServiceBulletinsModule,
    TroubleshootingModule,
    KnowledgeSearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
