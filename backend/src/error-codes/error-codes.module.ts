import { Module } from '@nestjs/common';
import { ErrorCodesService } from './error-codes.service';
import { ErrorCodesController } from './error-codes.controller';

@Module({
  controllers: [ErrorCodesController],
  providers: [ErrorCodesService],
})
export class ErrorCodesModule {}
