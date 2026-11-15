import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ClusteringWorker } from '../../../../workers/clustering-worker';

@Injectable()
export class ClustersService {
  constructor(private prisma: PrismaService) {}

  async listClusters(category?: string, isBreaking?: boolean, limit: number = 20) {
    const where: any = {};
    if (category) where.category = category.toLowerCase();
    if (isBreaking !== undefined) where.isBreaking = isBreaking;

    return this.prisma.storyCluster.findMany({
      where,
      include: {
        articles: {
          include: { source: true },
          orderBy: { publishedAt: 'desc' },
        },
      },
      orderBy: [
        { isBreaking: 'desc' },
        { lastPublishedAt: 'desc' },
      ],
      take: limit,
    });
  }

  async getClusterById(id: string) {
    const cluster = await this.prisma.storyCluster.findUnique({
      where: { id },
      include: {
        articles: {
          include: { source: true },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!cluster) {
      throw new NotFoundException(`Story cluster with ID '${id}' not found`);
    }

    return cluster;
  }

  async runClusteringPass() {
    // 1. Fetch unclustered or recent articles from the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000);
    const candidateArticles = await this.prisma.newsArticle.findMany({
      where: {
        publishedAt: { gte: fortyEightHoursAgo },
        clusterId: null,
      },
      select: {
        id: true,
        sourceId: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        category: true,
      },
    });

    if (candidateArticles.length < 2) {
      return { clustersCreated: 0, articlesClustered: 0 };
    }

    const clustersFound = ClusteringWorker.clusterArticles(candidateArticles);
    let clustersCreated = 0;
    let articlesClustered = 0;

    for (const cluster of clustersFound) {
      // Find category of representative article
      const rep = candidateArticles.find((a) => a.id === cluster.representativeArticleId);
      const category = rep?.category || 'general';

      const createdCluster = await this.prisma.storyCluster.create({
        data: {
          title: cluster.clusterTitle,
          representativeArticleId: cluster.representativeArticleId,
          category,
          articleCount: cluster.articleIds.length,
          isBreaking: cluster.isBreaking,
          firstPublishedAt: new Date(),
          lastPublishedAt: new Date(),
        },
      });

      // Update articles with this cluster ID
      await this.prisma.newsArticle.updateMany({
        where: { id: { in: cluster.articleIds } },
        data: {
          clusterId: createdCluster.id,
          isBreaking: cluster.isBreaking,
        },
      });

      clustersCreated++;
      articlesClustered += cluster.articleIds.length;
    }

    return {
      clustersCreated,
      articlesClustered,
    };
  }
}
