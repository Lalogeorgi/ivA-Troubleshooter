import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { isVersionInRange } from './semver.util';

interface GetProceduresParams {
  instrumentId: string;
  firmwareVersion: string;
  errorCode?: string;
  symptom?: string;
}

@Injectable()
export class TroubleshootingService {
  constructor(private prisma: PrismaService) {}

  async getProcedures(params: GetProceduresParams) {
    if (!params.instrumentId || !params.firmwareVersion) {
      throw new BadRequestException(
        'instrument_id and firmware_version are required',
      );
    }

    // Build the query to find completely matching procedures
    const procedures = await this.prisma.procedure.findMany({
      where: {
        instrumentId: params.instrumentId,
        // Match Error Code relation if provided
        ...(params.errorCode && {
          errorCodes: {
            some: {
              errorCode: {
                code: params.errorCode,
              },
            },
          },
        }),
        // Match Symptom relation if provided
        ...(params.symptom && {
          symptoms: {
            some: {
              symptom: {
                description: {
                  contains: params.symptom,
                },
              },
            },
          },
        }),
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
          include: {
            referenceDocument: true,
          },
        },
        errorCodes: {
          include: { errorCode: true },
        },
        symptoms: {
          include: { symptom: true },
        },
        serviceBulletins: {
          include: { serviceBulletin: true },
        },
      },
    });

    // Filter by firmware compatibility using robust semver utility
    return procedures.filter((proc) =>
      isVersionInRange(params.firmwareVersion, proc.firmwareMin, proc.firmwareMax),
    );
  }
}
