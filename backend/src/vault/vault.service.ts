import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { VaultParserService, VaultEntity, VaultCategory } from './vault-parser.service';

export interface SyncResult {
  totalFiles: number;
  parsedEntities: number;
  edgesCreated: number;
  warnings: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  category: VaultCategory;
  filePath: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private cachedEntities: Map<string, VaultEntity> = new Map();
  private aliasMap: Map<string, string> = new Map(); // lowercase alias/name -> canonical ID

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: VaultParserService,
  ) {}

  /**
   * Determine the absolute path of the knowledge vault directory
   */
  getVaultDirectory(): string {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, 'knowledge'),
      path.resolve(cwd, '../knowledge'),
      path.resolve(cwd, '../../knowledge'),
    ];

    for (const dir of candidates) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        return dir;
      }
    }

    // Default fallback
    return path.resolve(cwd, '../knowledge');
  }

  /**
   * Read all markdown files from vault directory recursively
   */
  private scanVaultFiles(dir: string, baseDir: string = dir): { fullPath: string; relPath: string }[] {
    const results: { fullPath: string; relPath: string }[] = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.scanVaultFiles(fullPath, baseDir));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        results.push({ fullPath, relPath });
      }
    }
    return results;
  }

  /**
   * Full scan, parse, and synchronize knowledge vault to PostgreSQL
   */
  async syncVault(): Promise<SyncResult> {
    const vaultDir = this.getVaultDirectory();
    this.logger.log(`Synchronizing Knowledge Vault from directory: ${vaultDir}`);

    const files = this.scanVaultFiles(vaultDir);
    const entities: VaultEntity[] = [];
    const warnings: string[] = [];

    this.cachedEntities.clear();
    this.aliasMap.clear();

    // 1. Parse all files and index IDs and aliases
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf-8');
        const entity = this.parser.parseMarkdownFile(content, file.fullPath, file.relPath);
        entities.push(entity);
        this.cachedEntities.set(entity.id, entity);

        // Register aliases for link resolution
        this.registerAlias(entity.id, entity.id);
        const fileNameWithoutExt = path.basename(file.relPath, '.md');
        this.registerAlias(fileNameWithoutExt, entity.id);

        if (entity.frontmatter.code) this.registerAlias(entity.frontmatter.code, entity.id);
        if (entity.frontmatter.name) this.registerAlias(entity.frontmatter.name, entity.id);
        if (entity.frontmatter.model) this.registerAlias(entity.frontmatter.model, entity.id);
        if (entity.frontmatter.part_number) this.registerAlias(entity.frontmatter.part_number, entity.id);
        if (entity.frontmatter.bulletin_code) this.registerAlias(entity.frontmatter.bulletin_code, entity.id);
      } catch (err: any) {
        warnings.push(`Failed to parse ${file.relPath}: ${err.message}`);
      }
    }

    // 2. Resolve edges
    const edgesToInsert: Array<{
      sourceId: string;
      sourceType: string;
      targetId: string;
      targetType: string;
      relationship: string;
      weight: number;
    }> = [];

    for (const entity of entities) {
      for (const link of entity.outboundLinks) {
        const targetId = this.resolveAlias(link.target);
        if (!targetId) {
          warnings.push(`Unresolved link [[${link.target}]] in ${entity.relativePath}`);
          continue;
        }

        const targetEntity = this.cachedEntities.get(targetId);
        const targetType = targetEntity ? targetEntity.category : 'UNKNOWN';
        const relationship = this.deriveRelationship(link.context, entity.category, targetType);

        edgesToInsert.push({
          sourceId: entity.id,
          sourceType: entity.category,
          targetId: targetId,
          targetType: targetType,
          relationship: relationship,
          weight: 1.0,
        });
      }
    }

    // 3. Persist KnowledgeEdges to Prisma
    try {
      // Clear legacy parsed edges to prevent duplication
      await this.prisma.knowledgeEdge.deleteMany({});

      if (edgesToInsert.length > 0) {
        await this.prisma.knowledgeEdge.createMany({
          data: edgesToInsert,
          skipDuplicates: true,
        });
      }
    } catch (dbErr: any) {
      this.logger.error(`Database error while persisting knowledge edges: ${dbErr.message}`);
      warnings.push(`DB error: ${dbErr.message}`);
    }

    this.logger.log(`Vault sync complete. Entities: ${entities.length}, Edges: ${edgesToInsert.length}`);

    return {
      totalFiles: files.length,
      parsedEntities: entities.length,
      edgesCreated: edgesToInsert.length,
      warnings,
    };
  }

  private registerAlias(alias: string, canonicalId: string) {
    if (!alias) return;
    const clean = alias.trim().toLowerCase();
    this.aliasMap.set(clean, canonicalId);
    // Also without hyphens or spaces
    this.aliasMap.set(clean.replace(/[-_\s]/g, ''), canonicalId);
  }

  private resolveAlias(target: string): string | null {
    if (!target) return null;
    const clean = target.trim().toLowerCase();
    return this.aliasMap.get(clean) || this.aliasMap.get(clean.replace(/[-_\s]/g, '')) || null;
  }

  private deriveRelationship(context: string, sourceType: string, targetType: string): string {
    const ctx = context.toLowerCase();
    if (ctx.includes('procedure')) return 'PROCEDURE_FOR';
    if (ctx.includes('component')) return 'AFFECTS';
    if (ctx.includes('spare_part') || ctx.includes('parts')) return 'USES_PART';
    if (ctx.includes('failure_mode')) return 'CAUSED_BY';
    if (ctx.includes('safety')) return 'REQUIRES_SAFETY';
    if (ctx.includes('subsystem')) return 'BELONGS_TO';
    if (ctx.includes('instrument')) return 'PART_OF';
    if (ctx.includes('bulletin')) return 'GOVERNED_BY';
    if (ctx.includes('error')) return 'INDICATES';

    if (sourceType === VaultCategory.ERROR_CODE && targetType === VaultCategory.PROCEDURE) return 'RESOLVES';
    if (sourceType === VaultCategory.COMPONENT && targetType === VaultCategory.FAILURE_MODE) return 'FAILS_WITH';

    return 'REFERENCES';
  }

  /**
   * Get single entity by ID or wikilink name
   */
  async getEntity(idOrName: string) {
    if (this.cachedEntities.size === 0) {
      await this.syncVault();
    }

    const canonicalId = this.resolveAlias(idOrName) || idOrName;
    const entity = this.cachedEntities.get(canonicalId);

    if (!entity) {
      throw new NotFoundException(`Knowledge entity '${idOrName}' not found in vault`);
    }

    // Retrieve inbound and outbound edges from database
    const outboundEdges = await this.prisma.knowledgeEdge.findMany({
      where: { sourceId: entity.id },
    });

    const inboundEdges = await this.prisma.knowledgeEdge.findMany({
      where: { targetId: entity.id },
    });

    return {
      ...entity,
      outboundEdges,
      inboundEdges,
    };
  }

  /**
   * Retrieve graph nodes and edges for network visualization
   */
  async getGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    if (this.cachedEntities.size === 0) {
      await this.syncVault();
    }

    const nodes: GraphNode[] = Array.from(this.cachedEntities.values()).map((e) => ({
      id: e.id,
      label: e.title,
      category: e.category,
      filePath: e.relativePath,
    }));

    const dbEdges = await this.prisma.knowledgeEdge.findMany();

    const edges: GraphEdge[] = dbEdges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      relationship: edge.relationship,
      weight: edge.weight,
    }));

    return { nodes, edges };
  }

  /**
   * List all entities in the vault
   */
  async listEntities(category?: string) {
    if (this.cachedEntities.size === 0) {
      await this.syncVault();
    }

    let entities = Array.from(this.cachedEntities.values());
    if (category) {
      const catUpper = category.toUpperCase();
      entities = entities.filter((e) => e.category === catUpper);
    }

    return entities.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      relativePath: e.relativePath,
      outboundLinksCount: e.outboundLinks.length,
      frontmatter: e.frontmatter,
    }));
  }
}
