import { Injectable, Logger } from '@nestjs/common';
import { HybridSearchService } from '../../knowledge-search/hybrid-search.service';
import { OntologyService } from '../../ontology/ontology.service';
import { VaultService } from '../../vault/vault.service';
import { GraphTraversalService } from '../../knowledge-search/graph-traversal.service';
import { DocumentsService } from '../../knowledge-ingestion/documents.service';
import { TroubleshootingService } from '../../troubleshooting/troubleshooting.service';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

@Injectable()
export class AgentToolsService {
  private readonly logger = new Logger(AgentToolsService.name);

  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly ontology: OntologyService,
    private readonly vault: VaultService,
    private readonly graphTraversal: GraphTraversalService,
    private readonly documents: DocumentsService,
    private readonly troubleshooting: TroubleshootingService,
  ) {}

  getAvailableTools(): ToolDefinition[] {
    return [
      {
        name: 'search_knowledge_hybrid',
        description: 'Execute multi-stage hybrid search (lexical + dense vector) across technical service documentation with layout coordinates.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term, alarm code, or symptom description' },
            instrumentId: { type: 'string', description: 'Instrument UUID to constrain search scope' },
            limit: { type: 'number', description: 'Maximum results to return' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_component_specs',
        description: 'Retrieve component engineering specifications, tolerances, telemetry tags, and replacement part numbers.',
        parameters: {
          type: 'object',
          properties: {
            idOrPartNumber: { type: 'string', description: 'Component UUID, name, or OEM part number' },
          },
          required: ['idOrPartNumber'],
        },
      },
      {
        name: 'get_vault_entity',
        description: 'Retrieve full Markdown knowledge object with YAML frontmatter and bidirectional relational links.',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Canonical ID or wikilink name of knowledge object' },
          },
          required: ['id'],
        },
      },
      {
        name: 'traverse_knowledge_graph',
        description: 'Traverse multi-hop relationships from an entity anchor across the knowledge graph (subsystems, failure modes, procedures).',
        parameters: {
          type: 'object',
          properties: {
            rootId: { type: 'string', description: 'Root entity ID to start traversal from' },
            depth: { type: 'number', description: 'Traversal depth (1 to 3)' },
          },
          required: ['rootId'],
        },
      },
      {
        name: 'inspect_provenance_page',
        description: 'Inspect layout chunks and exact bounding boxes for a specific page of an authoritative PDF manual.',
        parameters: {
          type: 'object',
          properties: {
            documentId: { type: 'string', description: 'Document UUID' },
            pageNumber: { type: 'number', description: '1-indexed page number' },
          },
          required: ['documentId', 'pageNumber'],
        },
      },
    ];
  }

  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    this.logger.log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);

    switch (name) {
      case 'search_knowledge_hybrid':
        return this.hybridSearch.search({
          query: args.query,
          instrumentId: args.instrumentId,
          limit: args.limit || 3,
        });

      case 'get_component_specs':
        return this.ontology.getComponent(args.idOrPartNumber);

      case 'get_vault_entity':
        return this.vault.getEntity(args.id);

      case 'traverse_knowledge_graph':
        return this.graphTraversal.traverse(args.rootId, args.depth || 2);

      case 'inspect_provenance_page':
        return this.documents.getDocumentPage(args.documentId, Number(args.pageNumber));

      default:
        throw new Error(`Unrecognized tool: ${name}`);
    }
  }
}
