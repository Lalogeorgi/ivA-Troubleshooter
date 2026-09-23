import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VaultParserService } from './vault-parser.service';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VaultController],
  providers: [VaultParserService, VaultService],
  exports: [VaultService, VaultParserService],
})
export class VaultModule {}
