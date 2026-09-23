import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface PackageManifest {
  formatVersion: string;
  createdAt: string;
  packageType: 'IVA_OFFLINE_BUNDLE';
  instrument: {
    id: string;
    model: string;
    manufacturer: string;
    modality?: string;
  };
  metrics: {
    subsystemsCount: number;
    componentsCount: number;
    sensorsCount: number;
    actuatorsCount: number;
    sparePartsCount: number;
    diagnosticNodesCount: number;
    knowledgeEdgesCount: number;
    documentsCount: number;
  };
  checksumSha256: string;
}

export interface OfflinePackageData {
  manifest: PackageManifest;
  ontology: {
    instrument: any;
    subsystems: any[];
    assemblies: any[];
    components: any[];
    sensors: any[];
    actuators: any[];
    spareParts: any[];
    failureModes: any[];
    componentFailureModes: any[];
  };
  diagnosticKnowledge: {
    procedures: any[];
    diagnosticStepNodes: any[];
    errorCodes: any[];
    symptoms: any[];
    serviceBulletins: any[];
    knowledgeEdges: any[];
  };
  documentation: {
    documents: any[];
    pages: any[];
    chunks: any[];
    binaryFiles: { [filename: string]: string }; // Base64 encoded PDF files
  };
}

@Injectable()
export class OfflinePackagerService {
  private readonly logger = new Logger(OfflinePackagerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export an air-gapped .iva-pkg offline bundle for a given instrument
   */
  async exportPackage(instrumentId: string, outputDirectory?: string): Promise<{ packagePath: string; manifest: PackageManifest }> {
    const instrument = await this.prisma.instrument.findUnique({
      where: { id: instrumentId },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument ${instrumentId} not found`);
    }

    this.logger.log(`Exporting air-gapped offline package for ${instrument.model} (${instrument.id})...`);

    // 1. Gather Physical Ontology
    const subsystems = await this.prisma.subsystem.findMany({ where: { instrumentId } });
    const subsystemIds = subsystems.map((s) => s.id);

    const assemblies = await this.prisma.assembly.findMany({ where: { subsystemId: { in: subsystemIds } } });
    const assemblyIds = assemblies.map((a) => a.id);

    const components = await this.prisma.component.findMany({ where: { assemblyId: { in: assemblyIds } } });
    const componentIds = components.map((c) => c.id);

    const sensors = await this.prisma.sensor.findMany({ where: { componentId: { in: componentIds } } });
    const actuators = await this.prisma.actuator.findMany({ where: { componentId: { in: componentIds } } });
    const spareParts = await this.prisma.sparePart.findMany({ where: { componentId: { in: componentIds } } });
    const componentFailureModes = await this.prisma.componentFailureMode.findMany({ where: { componentId: { in: componentIds } } });
    const failureModes = await this.prisma.failureMode.findMany();

    // 2. Gather Diagnostic Decision Knowledge
    const procedures = await this.prisma.procedure.findMany({ where: { instrumentId } });
    const procedureIds = procedures.map((p) => p.id);

    const diagnosticStepNodes = await this.prisma.diagnosticStepNode.findMany({ where: { procedureId: { in: procedureIds } } });
    const errorCodes = await this.prisma.errorCode.findMany({ where: { instrumentId } });
    const symptoms = await this.prisma.symptom.findMany({ where: { instrumentId } });
    const serviceBulletins = await this.prisma.serviceBulletin.findMany({ where: { instrumentId } });
    const knowledgeEdges = await this.prisma.knowledgeEdge.findMany();

    // 3. Gather Layout-Aware Documents & PDF Binaries
    const documents = await this.prisma.document.findMany({ where: { instrumentId } });
    const documentIds = documents.map((d) => d.id);

    const pages = await this.prisma.documentPage.findMany({ where: { documentId: { in: documentIds } } });
    const chunks = await this.prisma.documentChunk.findMany({
      where: { documentId: { in: documentIds } },
      select: {
        id: true,
        documentId: true,
        chunkText: true,
        pageNumber: true,
        sectionTitle: true,
        boundingBox: true,
        chunkType: true,
        tokenCount: true,
        createdAt: true,
      },
    });

    // Read PDF binary files as base64
    const binaryFiles: { [filename: string]: string } = {};
    for (const doc of documents) {
      if (fs.existsSync(doc.filePath)) {
        const baseName = path.basename(doc.filePath);
        const buffer = fs.readFileSync(doc.filePath);
        binaryFiles[baseName] = buffer.toString('base64');
      }
    }

    // 4. Construct Payload
    const payloadWithoutChecksum: Omit<OfflinePackageData, 'manifest'> & { manifest: Omit<PackageManifest, 'checksumSha256'> } = {
      manifest: {
        formatVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        packageType: 'IVA_OFFLINE_BUNDLE',
        instrument: {
          id: instrument.id,
          model: instrument.model,
          manufacturer: instrument.manufacturer,
          modality: instrument.modality || undefined,
        },
        metrics: {
          subsystemsCount: subsystems.length,
          componentsCount: components.length,
          sensorsCount: sensors.length,
          actuatorsCount: actuators.length,
          sparePartsCount: spareParts.length,
          diagnosticNodesCount: diagnosticStepNodes.length,
          knowledgeEdgesCount: knowledgeEdges.length,
          documentsCount: documents.length,
        },
      },
      ontology: {
        instrument,
        subsystems,
        assemblies,
        components,
        sensors,
        actuators,
        spareParts,
        failureModes,
        componentFailureModes,
      },
      diagnosticKnowledge: {
        procedures,
        diagnosticStepNodes,
        errorCodes,
        symptoms,
        serviceBulletins,
        knowledgeEdges,
      },
      documentation: {
        documents,
        pages,
        chunks,
        binaryFiles,
      },
    };

    // 5. Calculate Cryptographic SHA-256 Checksum
    const contentString = JSON.stringify(payloadWithoutChecksum);
    const checksumSha256 = crypto.createHash('sha256').update(contentString).digest('hex');

    const fullPackage: OfflinePackageData = {
      ...payloadWithoutChecksum,
      manifest: {
        ...payloadWithoutChecksum.manifest,
        checksumSha256,
      },
    };

    // 6. Write to disk as `.iva-pkg`
    const targetDir = outputDirectory || path.resolve(process.cwd(), 'exports');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const sanitizedModel = instrument.model.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${sanitizedModel}_v${payloadWithoutChecksum.manifest.formatVersion}.iva-pkg`;
    const fullPath = path.join(targetDir, fileName);

    fs.writeFileSync(fullPath, JSON.stringify(fullPackage, null, 2), 'utf-8');
    this.logger.log(`Offline package generated: ${fullPath} (Checksum: ${checksumSha256})`);

    return {
      packagePath: fullPath,
      manifest: fullPackage.manifest,
    };
  }

  /**
   * Verify integrity and cryptographically validate an .iva-pkg offline bundle
   */
  async verifyPackage(packagePath: string): Promise<{ valid: boolean; manifest: PackageManifest; errors: string[] }> {
    if (!fs.existsSync(packagePath)) {
      throw new NotFoundException(`Package file not found at ${packagePath}`);
    }

    const raw = fs.readFileSync(packagePath, 'utf-8');
    let pkg: OfflinePackageData;
    try {
      pkg = JSON.parse(raw);
    } catch (e: any) {
      return { valid: false, manifest: null as any, errors: [`JSON Parse Error: ${e.message}`] };
    }

    const errors: string[] = [];
    if (!pkg.manifest || pkg.manifest.packageType !== 'IVA_OFFLINE_BUNDLE') {
      errors.push('Invalid package manifest: missing or incorrect packageType');
    }

    // Verify SHA-256
    const declaredChecksum = pkg.manifest?.checksumSha256;
    const testCopy = {
      ...pkg,
      manifest: {
        ...pkg.manifest,
        checksumSha256: undefined,
      },
    };
    // Delete checksum property for recalculation
    delete (testCopy.manifest as any).checksumSha256;

    const computedChecksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(testCopy))
      .digest('hex');

    if (declaredChecksum !== computedChecksum) {
      errors.push(`Integrity verification failed: declared SHA-256 (${declaredChecksum}) does not match computed (${computedChecksum})`);
    }

    return {
      valid: errors.length === 0,
      manifest: pkg.manifest,
      errors,
    };
  }
}
