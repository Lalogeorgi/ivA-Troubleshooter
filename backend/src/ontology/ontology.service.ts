import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OntologyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieve the complete physical equipment hierarchy tree for an instrument:
   * Instrument -> Subsystems -> Assemblies -> Components -> (Sensors, Actuators, SpareParts)
   */
  async getInstrumentTree(instrumentId: string) {
    const instrument = await this.prisma.instrument.findUnique({
      where: { id: instrumentId },
      include: {
        subsystems: {
          orderBy: { name: 'asc' },
          include: {
            assemblies: {
              orderBy: { name: 'asc' },
              include: {
                components: {
                  orderBy: { name: 'asc' },
                  include: {
                    sensors: true,
                    actuators: true,
                    spareParts: true,
                    failureModes: {
                      include: {
                        failureMode: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument with ID ${instrumentId} not found`);
    }

    return instrument;
  }

  /**
   * Fetch single component details by ID or OEM part number
   */
  async getComponent(idOrPartNumber: string) {
    const component = await this.prisma.component.findFirst({
      where: {
        OR: [{ id: idOrPartNumber }, { partNumber: idOrPartNumber }],
      },
      include: {
        assembly: {
          include: {
            subsystem: {
              include: {
                instrument: true,
              },
            },
          },
        },
        sensors: true,
        actuators: true,
        spareParts: true,
        failureModes: {
          include: {
            failureMode: true,
          },
        },
      },
    });

    if (!component) {
      throw new NotFoundException(`Component ${idOrPartNumber} not found`);
    }

    return component;
  }

  /**
   * Look up an installed field asset by serial number (FSE arrival scenario)
   */
  async getInstalledAsset(serialNumber: string) {
    const asset = await this.prisma.installedAsset.findUnique({
      where: { serialNumber },
      include: {
        instrument: {
          include: {
            subsystems: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        site: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Installed asset with serial number ${serialNumber} not found`);
    }

    return asset;
  }

  /**
   * List all registered installed assets with site information
   */
  async listInstalledAssets(instrumentId?: string) {
    return this.prisma.installedAsset.findMany({
      where: instrumentId ? { instrumentId } : undefined,
      include: {
        instrument: true,
        site: true,
      },
      orderBy: { serialNumber: 'asc' },
    });
  }

  /**
   * List all registered customer hospital / lab sites
   */
  async listCustomerSites() {
    return this.prisma.customerSite.findMany({
      include: {
        assets: {
          include: {
            instrument: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
