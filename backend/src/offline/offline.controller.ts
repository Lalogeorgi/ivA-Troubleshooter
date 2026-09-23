import { Controller, Get, Post, Param, Body, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OfflinePackagerService } from './offline-packager.service';

export class ExportPackageDto {
  instrumentId: string;
}

export class VerifyPackageDto {
  packagePath: string;
}

@Controller(['offline', 'api/v1/offline'])
export class OfflineController {
  constructor(private readonly packager: OfflinePackagerService) {}

  @Post('export')
  exportPackage(@Body() dto: ExportPackageDto) {
    return this.packager.exportPackage(dto.instrumentId);
  }

  @Post('verify')
  verifyPackage(@Body() dto: VerifyPackageDto) {
    return this.packager.verifyPackage(dto.packagePath);
  }
}
