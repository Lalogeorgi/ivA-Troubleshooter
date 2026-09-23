import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TraversedNode {
  id: string;
  type: string;
  depth: number;
}

export interface TraversedEdge {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationship: string;
  weight: number;
  depth: number;
}

export interface GraphTraversalResult {
  rootId: string;
  nodes: TraversedNode[];
  edges: TraversedEdge[];
  summary: string[];
}

@Injectable()
export class GraphTraversalService {
  private readonly logger = new Logger(GraphTraversalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Traverse graph connections starting from a root entity ID up to maxDepth hops
   */
  async traverse(rootId: string, maxDepth: number = 2): Promise<GraphTraversalResult> {
    const depthLimit = Math.min(Math.max(1, maxDepth), 3);
    const visitedNodes = new Map<string, TraversedNode>();
    const collectedEdges: TraversedEdge[] = [];
    const edgeKeySet = new Set<string>();

    // Initial frontier
    let currentFrontier = [rootId];
    visitedNodes.set(rootId, { id: rootId, type: 'ROOT', depth: 0 });

    for (let depth = 1; depth <= depthLimit; depth++) {
      if (currentFrontier.length === 0) break;

      const edges = await this.prisma.knowledgeEdge.findMany({
        where: {
          OR: [
            { sourceId: { in: currentFrontier } },
            { targetId: { in: currentFrontier } },
          ],
        },
      });

      const nextFrontier: string[] = [];

      for (const edge of edges) {
        const edgeKey = `${edge.sourceId}->${edge.targetId}:${edge.relationship}`;
        if (!edgeKeySet.has(edgeKey)) {
          edgeKeySet.add(edgeKey);
          collectedEdges.push({
            id: edge.id,
            sourceId: edge.sourceId,
            sourceType: edge.sourceType,
            targetId: edge.targetId,
            targetType: edge.targetType,
            relationship: edge.relationship,
            weight: edge.weight,
            depth,
          });
        }

        // Add target node if not visited
        if (!visitedNodes.has(edge.targetId)) {
          visitedNodes.set(edge.targetId, {
            id: edge.targetId,
            type: edge.targetType,
            depth,
          });
          nextFrontier.push(edge.targetId);
        }

        // Add source node if not visited
        if (!visitedNodes.has(edge.sourceId)) {
          visitedNodes.set(edge.sourceId, {
            id: edge.sourceId,
            type: edge.sourceType,
            depth,
          });
          nextFrontier.push(edge.sourceId);
        }
      }

      currentFrontier = nextFrontier;
    }

    const nodes = Array.from(visitedNodes.values());
    const summary = collectedEdges.map(
      (e) => `[${e.sourceType}] ${e.sourceId} -(${e.relationship})-> [${e.targetType}] ${e.targetId}`
    );

    return {
      rootId,
      nodes,
      edges: collectedEdges,
      summary,
    };
  }

  /**
   * Search for known entity mentions (error codes, part numbers, component codes)
   * in raw user text to seed graph traversal.
   */
  async findEntityAnchors(query: string): Promise<string[]> {
    const anchors: string[] = [];
    const tokens = query.toUpperCase().match(/\b[A-Z0-9_-]{3,}\b/g) || [];

    for (const token of tokens) {
      // Check if token matches any KnowledgeEdge source or target
      const edgeMatch = await this.prisma.knowledgeEdge.findFirst({
        where: {
          OR: [
            { sourceId: { contains: token, mode: 'insensitive' } },
            { targetId: { contains: token, mode: 'insensitive' } },
          ],
        },
      });

      if (edgeMatch) {
        const matched =
          edgeMatch.sourceId.toUpperCase().includes(token)
            ? edgeMatch.sourceId
            : edgeMatch.targetId;
        if (!anchors.includes(matched)) {
          anchors.push(matched);
        }
      }
    }

    return anchors;
  }
}
