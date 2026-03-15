import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { MachinesModule } from './machines/machines.module';
import { InterventionSessionsModule } from './intervention-sessions/intervention-sessions.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [PrismaModule, InstrumentsModule, MachinesModule, InterventionSessionsModule, ModulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
