import { Deduplicator } from '../ingestion/deduplicator';

export interface ClusterCandidate {
  id: string;
  sourceId: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  clusterId?: string | null;
}

export interface ClusteringResult {
  clusterTitle: string;
  representativeArticleId: string;
  articleIds: string[];
  isBreaking: boolean;
  distinctSourcesCount: number;
}

export class ClusteringWorker {
  static readonly SIMILARITY_THRESHOLD = 0.28;
  static readonly BREAKING_MIN_SOURCES = 3;
  static readonly BREAKING_WINDOW_HOURS = 4;

  /**
   * Evaluates a collection of candidate articles and identifies clusters.
   */
  static clusterArticles(articles: ClusterCandidate[]): ClusteringResult[] {
    const results: ClusteringResult[] = [];
    const assignedIds = new Set<string>();

    for (let i = 0; i < articles.length; i++) {
      const primary = articles[i];
      if (assignedIds.has(primary.id)) continue;

      const clusterGroup: ClusterCandidate[] = [primary];
      const sourceIds = new Set<string>([primary.sourceId]);

      for (let j = i + 1; j < articles.length; j++) {
        const candidate = articles[j];
        if (assignedIds.has(candidate.id)) continue;

        // Check text similarity
        const titleSim = Deduplicator.calculateJaccardSimilarity(primary.title, candidate.title);
        const excerptSim = Deduplicator.calculateJaccardSimilarity(primary.excerpt, candidate.excerpt);
        const combinedSim = Math.max(titleSim, excerptSim * 0.8 + titleSim * 0.2);

        if (combinedSim >= this.SIMILARITY_THRESHOLD) {
          clusterGroup.push(candidate);
          sourceIds.add(candidate.sourceId);
        }
      }

      if (clusterGroup.length > 1) {
        for (const item of clusterGroup) {
          assignedIds.add(item.id);
        }

        // Sort by publishedAt ascending (earliest first)
        clusterGroup.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
        const representative = clusterGroup[0];

        // Check breaking status: burst of coverage from >= 3 distinct sources within 4 hours
        const firstTime = clusterGroup[0].publishedAt.getTime();
        const lastTime = clusterGroup[clusterGroup.length - 1].publishedAt.getTime();
        const timespanHours = (lastTime - firstTime) / (1000 * 3600);

        const isBreaking =
          sourceIds.size >= this.BREAKING_MIN_SOURCES && timespanHours <= this.BREAKING_WINDOW_HOURS;

        results.push({
          clusterTitle: representative.title,
          representativeArticleId: representative.id,
          articleIds: clusterGroup.map((c) => c.id),
          isBreaking,
          distinctSourcesCount: sourceIds.size,
        });
      }
    }

    return results;
  }
}
