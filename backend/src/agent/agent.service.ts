import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmProviderFactory } from './llm-provider.factory';
import { AgentToolsService } from './tools/agent-tools.service';
import { OntologyService } from '../ontology/ontology.service';

export interface DiagnoseRequest {
  prompt: string;
  sessionId?: string;
  instrumentId?: string;
  serialNumber?: string;
  firmwareVersion?: string;
}

export interface DiagnosticFinding {
  statement: string;
  source: string;
  pageNumber?: number;
}

export interface DiagnosticHypothesis {
  hypothesis: string;
  probability: number;
  reasoning: string;
}

export interface ActionPlanStep {
  stepNumber: number;
  action: string;
  requiresFseApproval: boolean;
  partNumber?: string;
}

export interface DiagnosticReport {
  summary: string;
  confidenceScore: number;
  documentedFacts: DiagnosticFinding[];
  historicalObservations: Array<{ observation: string; confidence: string }>;
  deterministicRules: Array<{ rule: string; status: string }>;
  aiHypotheses: DiagnosticHypothesis[];
  safetyAlerts: Array<{ level: string; directive: string }>;
  actionPlan: ActionPlanStep[];
}

export interface AgentDiagnoseResponse {
  traceId: string;
  provider: string;
  model: string;
  latencyMs: number;
  report: DiagnosticReport;
  retrievedEvidenceCount: number;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: LlmProviderFactory,
    private readonly toolsService: AgentToolsService,
    private readonly ontology: OntologyService,
  ) {}

  /**
   * Execute schema-enforced diagnostic reasoning loop with complete audit tracing
   */
  async diagnose(request: DiagnoseRequest): Promise<AgentDiagnoseResponse> {
    const startTime = Date.now();
    const provider = this.providerFactory.getProvider();
    const toolsCalled: Array<{ tool: string; args: any; timestamp: string }> = [];
    const retrievedEvidence: Record<string, any> = {};

    this.logger.log(`Starting diagnosis with provider: ${provider.name} (${provider.model})`);

    // 1. Resolve Instrument Context if serial number given
    let resolvedInstrumentId = request.instrumentId;
    let assetInfo: any = null;
    if (request.serialNumber) {
      try {
        assetInfo = await this.ontology.getInstalledAsset(request.serialNumber);
        if (assetInfo) {
          resolvedInstrumentId = assetInfo.instrumentId;
          retrievedEvidence['installedAsset'] = {
            serialNumber: assetInfo.serialNumber,
            site: assetInfo.site?.name,
            firmwareVersion: assetInfo.firmwareVersion,
            status: assetInfo.status,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve serial number ${request.serialNumber}: ${err.message}`);
      }
    }

    // 2. Execute Hybrid Search
    toolsCalled.push({
      tool: 'search_knowledge_hybrid',
      args: { query: request.prompt, instrumentId: resolvedInstrumentId },
      timestamp: new Date().toISOString(),
    });

    const searchResult = await this.toolsService.executeTool('search_knowledge_hybrid', {
      query: request.prompt,
      instrumentId: resolvedInstrumentId,
      limit: 3,
    });
    retrievedEvidence['searchResults'] = searchResult.results;

    // 3. Extract Entity Mentions and Traverse Graph
    const queryTokens = request.prompt.toUpperCase().match(/\b[A-Z0-9_-]{3,}\b/g) || [];
    for (const token of queryTokens) {
      if (token.startsWith('E') || token.startsWith('P') || token.startsWith('PS') || token.startsWith('SP')) {
        toolsCalled.push({
          tool: 'traverse_knowledge_graph',
          args: { rootId: token, depth: 2 },
          timestamp: new Date().toISOString(),
        });
        try {
          const trav = await this.toolsService.executeTool('traverse_knowledge_graph', {
            rootId: token,
            depth: 2,
          });
          if (trav && trav.nodes && trav.nodes.length > 0) {
            retrievedEvidence[`graph_${token}`] = {
              nodesCount: trav.nodes.length,
              sampleEdges: trav.summary.slice(0, 6),
            };
          }
        } catch {
          // Non-blocking
        }
      }
    }

    // 4. Synthesize Diagnostic Report with Provider
    const synthesisPrompt = `
Analyze the following clinical device intervention request:
Problem Statement: "${request.prompt}"
Firmware Version: "${request.firmwareVersion || assetInfo?.firmwareVersion || '4.2.1'}"
Serial Number: "${request.serialNumber || 'N/A'}"

RETRIEVED DOCUMENTATION EVIDENCE:
${JSON.stringify(retrievedEvidence, null, 2)}

Provide a strict, grounded clinical diagnostic report. Categorize all findings into:
1. documentedFacts (verifiable statements directly cited from manuals with page numbers)
2. historicalObservations (known failure modes and frequencies)
3. deterministicRules (physical tolerances like 114-126 kPa)
4. aiHypotheses (ranked potential causes with probabilities)
5. safetyAlerts (mandatory PPE and LOTO rules)
6. actionPlan (ordered steps; flag consequential actions with requiresFseApproval=true)
`;

    const systemPrompt =
      'You are the BioMed Field Service AI Diagnostic Specialist. You prioritize patient safety, regulatory compliance, and mechanical accuracy. Never invent undocumented procedures.';

    const report: DiagnosticReport = await provider.generateStructured<DiagnosticReport>(
      synthesisPrompt,
      { systemPrompt }
    );

    const latencyMs = Date.now() - startTime;

    // 5. Persist Audit Trace into PostgreSQL
    const trace = await this.prisma.agentExecutionTrace.create({
      data: {
        sessionId: request.sessionId,
        instrumentId: resolvedInstrumentId,
        prompt: request.prompt,
        provider: provider.name,
        model: provider.model,
        toolsCalled: toolsCalled as any,
        retrievedEvidence: retrievedEvidence as any,
        finalResponse: JSON.stringify(report),
        tokenCount: Math.round(synthesisPrompt.length / 4),
        latencyMs,
      },
    });

    this.logger.log(`Diagnostic trace persisted with ID: ${trace.id} in ${latencyMs}ms`);

    return {
      traceId: trace.id,
      provider: provider.name,
      model: provider.model,
      latencyMs,
      report,
      retrievedEvidenceCount: Object.keys(retrievedEvidence).length,
    };
  }

  /**
   * Retrieve execution traces for audit and provenance verification
   */
  async getTraces(sessionId?: string, limit: number = 20) {
    return this.prisma.agentExecutionTrace.findMany({
      where: sessionId ? { sessionId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get single trace by ID
   */
  async getTrace(id: string) {
    return this.prisma.agentExecutionTrace.findUnique({
      where: { id },
    });
  }
}
