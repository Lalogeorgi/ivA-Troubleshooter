import { Injectable, Logger } from '@nestjs/common';

export enum VaultCategory {
  INSTRUMENT = 'INSTRUMENT',
  SUBSYSTEM = 'SUBSYSTEM',
  COMPONENT = 'COMPONENT',
  ERROR_CODE = 'ERROR_CODE',
  SYMPTOM = 'SYMPTOM',
  PROCEDURE = 'PROCEDURE',
  SERVICE_BULLETIN = 'SERVICE_BULLETIN',
  FAILURE_MODE = 'FAILURE_MODE',
  SPARE_PART = 'SPARE_PART',
  SAFETY_PROTOCOL = 'SAFETY_PROTOCOL',
  GENERAL = 'GENERAL',
}

export interface ExtractedWikilink {
  target: string;
  alias?: string;
  raw: string;
  context: string;
}

export interface ParsedFrontmatter {
  id?: string;
  code?: string;
  title?: string;
  name?: string;
  model?: string;
  manufacturer?: string;
  modality?: string;
  part_number?: string;
  oem_part_number?: string;
  subsystem?: string;
  instrument?: string;
  severity?: string;
  firmware_min?: string;
  firmware_max?: string;
  procedure_type?: string;
  bulletin_code?: string;
  release_date?: string;
  unit_cost?: number;
  inventory_min?: number;
  mesh_node_id?: string;
  is_field_replaceable?: boolean;
  expected_lifespan_hours?: number;
  [key: string]: any;
}

export interface VaultEntity {
  filePath: string;
  relativePath: string;
  category: VaultCategory;
  id: string;
  title: string;
  frontmatter: ParsedFrontmatter;
  rawContent: string;
  bodyContent: string;
  outboundLinks: ExtractedWikilink[];
}

@Injectable()
export class VaultParserService {
  private readonly logger = new Logger(VaultParserService.name);

  /**
   * Parse a raw Markdown file content with YAML frontmatter and [[wikilinks]]
   */
  parseMarkdownFile(content: string, filePath: string, relativePath: string): VaultEntity {
    const { frontmatter, body } = this.extractFrontmatter(content);
    const category = this.inferCategory(relativePath, frontmatter);
    const outboundLinks = this.extractWikilinks(frontmatter, body);

    const title =
      frontmatter.title ||
      frontmatter.name ||
      frontmatter.model ||
      frontmatter.code ||
      this.extractH1Title(body) ||
      relativePath.replace(/\.md$/, '').split('/').pop() ||
      'Untitled';

    const id =
      frontmatter.id ||
      frontmatter.code ||
      frontmatter.part_number ||
      frontmatter.bulletin_code ||
      this.generateIdFromPath(relativePath);

    return {
      filePath,
      relativePath,
      category,
      id,
      title,
      frontmatter,
      rawContent: content,
      bodyContent: body,
      outboundLinks,
    };
  }

  /**
   * Zero-dependency YAML frontmatter parser
   */
  private extractFrontmatter(content: string): { frontmatter: ParsedFrontmatter; body: string } {
    const lines = content.split(/\r?\n/);
    if (lines.length === 0 || lines[0].trim() !== '---') {
      return { frontmatter: {}, body: content };
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return { frontmatter: {}, body: content };
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const body = lines.slice(endIndex + 1).join('\n').trim();
    const frontmatter = this.parseYamlLines(frontmatterLines);

    return { frontmatter, body };
  }

  /**
   * Parse flat and array YAML lines
   */
  private parseYamlLines(lines: string[]): ParsedFrontmatter {
    const result: Record<string, any> = {};
    let currentKey: string | null = null;
    let currentArray: any[] | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line || line.trim().startsWith('#')) continue;

      const listItemMatch = line.match(/^(\s*)-\s*(.*)$/);
      if (listItemMatch && currentKey) {
        if (!currentArray) {
          currentArray = [];
          result[currentKey] = currentArray;
        }
        currentArray.push(this.cleanValue(listItemMatch[2]));
        continue;
      }

      const keyValMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (keyValMatch) {
        const key = keyValMatch[1].trim();
        const rawVal = keyValMatch[2].trim();

        if (rawVal === '') {
          currentKey = key;
          currentArray = null;
          result[key] = [];
        } else {
          currentKey = null;
          currentArray = null;
          result[key] = this.cleanValue(rawVal);
        }
      }
    }

    return result;
  }

  private cleanValue(val: string): any {
    let clean = val.trim();
    // Strip surrounding quotes
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1).trim();
    }

    // Booleans
    if (clean.toLowerCase() === 'true') return true;
    if (clean.toLowerCase() === 'false') return false;

    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
      return Number(clean);
    }

    return clean;
  }

  /**
   * Extract all [[target|alias]] wikilinks from frontmatter and markdown body
   */
  private extractWikilinks(frontmatter: ParsedFrontmatter, body: string): ExtractedWikilink[] {
    const links: ExtractedWikilink[] = [];
    const seen = new Set<string>();

    const linkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

    const addLink = (raw: string, target: string, alias: string | undefined, context: string) => {
      const trimmedTarget = target.trim();
      const key = `${trimmedTarget.toLowerCase()}::${context}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push({
          raw,
          target: trimmedTarget,
          alias: alias ? alias.trim() : undefined,
          context,
        });
      }
    };

    // Scan frontmatter
    for (const [key, val] of Object.entries(frontmatter)) {
      if (typeof val === 'string') {
        let match: RegExpExecArray | null;
        while ((match = linkRegex.exec(val)) !== null) {
          addLink(match[0], match[1], match[2], `frontmatter.${key}`);
        }
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'string') {
            let match: RegExpExecArray | null;
            while ((match = linkRegex.exec(item)) !== null) {
              addLink(match[0], match[1], match[2], `frontmatter.${key}`);
            }
          }
        }
      }
    }

    // Scan body
    let bodyMatch: RegExpExecArray | null;
    linkRegex.lastIndex = 0;
    while ((bodyMatch = linkRegex.exec(body)) !== null) {
      addLink(bodyMatch[0], bodyMatch[1], bodyMatch[2], 'body');
    }

    return links;
  }

  private extractH1Title(body: string): string | null {
    const match = body.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  private inferCategory(relativePath: string, frontmatter: ParsedFrontmatter): VaultCategory {
    const norm = relativePath.toLowerCase().replace(/\\/g, '/');
    if (norm.startsWith('instruments/')) return VaultCategory.INSTRUMENT;
    if (norm.startsWith('subsystems/')) return VaultCategory.SUBSYSTEM;
    if (norm.startsWith('components/')) return VaultCategory.COMPONENT;
    if (norm.startsWith('errors/')) return VaultCategory.ERROR_CODE;
    if (norm.startsWith('symptoms/')) return VaultCategory.SYMPTOM;
    if (norm.startsWith('procedures/')) return VaultCategory.PROCEDURE;
    if (norm.startsWith('service-bulletins/')) return VaultCategory.SERVICE_BULLETIN;
    if (norm.startsWith('failure-modes/')) return VaultCategory.FAILURE_MODE;
    if (norm.startsWith('parts/')) return VaultCategory.SPARE_PART;
    if (norm.startsWith('safety/')) return VaultCategory.SAFETY_PROTOCOL;

    // Check frontmatter hints
    if (frontmatter.procedure_type) return VaultCategory.PROCEDURE;
    if (frontmatter.bulletin_code) return VaultCategory.SERVICE_BULLETIN;
    if (frontmatter.code && frontmatter.code.startsWith('FM-')) return VaultCategory.FAILURE_MODE;
    if (frontmatter.code && frontmatter.code.startsWith('E')) return VaultCategory.ERROR_CODE;
    if (frontmatter.oem_part_number || frontmatter.unit_cost !== undefined) return VaultCategory.SPARE_PART;

    return VaultCategory.GENERAL;
  }

  private generateIdFromPath(relativePath: string): string {
    const base = relativePath.replace(/\.md$/, '').split(/[/\\]/).pop() || 'UNKNOWN';
    return base.toUpperCase();
  }
}
