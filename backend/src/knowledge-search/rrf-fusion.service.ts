export interface RankedItem<T> {
  item: T;
  rank: number;
  score: number;
}

export interface FusionResult<T> {
  item: T;
  rrfScore: number;
  lexicalRank?: number;
  vectorRank?: number;
  matchedBy: 'EXACT_MATCH' | 'SEMANTIC_VECTOR' | 'HYBRID';
}

export class RrfFusionService {
  /**
   * Reciprocal Rank Fusion (RRF) algorithm:
   * Score(d) = sum_i( weight_i / (k + rank_i(d)) )
   * Standard constant k = 60
   */
  static fuse<T extends { id: string }>(
    lexicalItems: T[],
    vectorItems: T[],
    options: {
      k?: number;
      lexicalWeight?: number;
      vectorWeight?: number;
      limit?: number;
    } = {}
  ): FusionResult<T>[] {
    const k = options.k ?? 60;
    const lexicalWeight = options.lexicalWeight ?? 0.5;
    const vectorWeight = options.vectorWeight ?? 0.5;
    const limit = options.limit ?? 10;

    const itemMap = new Map<string, T>();
    const lexicalRanks = new Map<string, number>();
    const vectorRanks = new Map<string, number>();
    const scores = new Map<string, number>();

    // Index lexical ranks (1-based)
    lexicalItems.forEach((item, index) => {
      itemMap.set(item.id, item);
      lexicalRanks.set(item.id, index + 1);
      const rrf = lexicalWeight / (k + index + 1);
      scores.set(item.id, (scores.get(item.id) || 0) + rrf);
    });

    // Index vector ranks (1-based)
    vectorItems.forEach((item, index) => {
      itemMap.set(item.id, item);
      vectorRanks.set(item.id, index + 1);
      const rrf = vectorWeight / (k + index + 1);
      scores.set(item.id, (scores.get(item.id) || 0) + rrf);
    });

    // Build fused output
    const fused: FusionResult<T>[] = [];
    for (const [id, score] of scores.entries()) {
      const item = itemMap.get(id)!;
      const lRank = lexicalRanks.get(id);
      const vRank = vectorRanks.get(id);

      let matchedBy: 'EXACT_MATCH' | 'SEMANTIC_VECTOR' | 'HYBRID' = 'HYBRID';
      if (lRank && !vRank) matchedBy = 'EXACT_MATCH';
      else if (!lRank && vRank) matchedBy = 'SEMANTIC_VECTOR';

      fused.push({
        item,
        rrfScore: Math.round(score * 100000) / 100000,
        lexicalRank: lRank,
        vectorRank: vRank,
        matchedBy,
      });
    }

    // Sort by RRF score descending
    fused.sort((a, b) => b.rrfScore - a.rrfScore);

    return fused.slice(0, limit);
  }
}
