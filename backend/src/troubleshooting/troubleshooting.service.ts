import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    // Convert firmware to a comparable format (simple float parsing for standard "X.Y" format)
    const fw = parseFloat(params.firmwareVersion);
    console.log('Incoming Params:', params);
    console.log('Parsed Firmware:', fw);

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
        },
        errorCodes: {
          include: { errorCode: true },
        },
        symptoms: {
          include: { symptom: true },
        },
      },
    });

    console.log(
      'Found completely matching procedures (pre-fw filter):',
      procedures.map((p) => p.id),
    );

    // Filter by firmware in memory due to Prisma SQLite lacking complex float comparison natively for string fields
    const finalResults = procedures.filter((proc) => {
      // If the procedure has no firmware bounds, it is compatible
      if (!proc.firmwareMin && !proc.firmwareMax) return true;

      const min = proc.firmwareMin ? parseFloat(proc.firmwareMin) : -Infinity;
      const max = proc.firmwareMax ? parseFloat(proc.firmwareMax) : Infinity;

      return fw >= min && fw <= max;
    });

    console.log(
      'Final results after FW filter:',
      finalResults.map((p) => p.id),
    );
    return finalResults;
  }
}
