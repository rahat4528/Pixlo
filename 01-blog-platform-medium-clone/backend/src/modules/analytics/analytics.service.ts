import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RecordViewDto } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(articleId: string, dto: RecordViewDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    const existingSession = await this.prisma.articleAnalytics.findUnique({
      where: {
        articleId_sessionId: {
          articleId,
          sessionId: dto.sessionId,
        },
      },
    });

    if (existingSession) {
      // Update completion depth without incrementing total views (deduplication)
      return this.prisma.articleAnalytics.update({
        where: { id: existingSession.id },
        data: {
          readCompletionPercent: Math.max(existingSession.readCompletionPercent, dto.readCompletionPercent || 0),
          timeSpentSeconds: existingSession.timeSpentSeconds + (dto.timeSpentSeconds || 0),
        },
      });
    }

    // New unique view session
    const [analytics] = await Promise.all([
      this.prisma.articleAnalytics.create({
        data: {
          articleId,
          sessionId: dto.sessionId,
          userAgent: dto.userAgent || '',
          readCompletionPercent: dto.readCompletionPercent || 0,
          timeSpentSeconds: dto.timeSpentSeconds || 0,
        },
      }),
      this.prisma.article.update({
        where: { id: articleId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return analytics;
  }

  async getAuthorDashboard(authorId: string) {
    const articles = await this.prisma.article.findMany({
      where: { authorId },
      include: {
        analytics: true,
        reactions: { where: { type: 'APPLAUSE' } },
      },
      orderBy: { viewCount: 'desc' },
    });

    let totalViews = 0;
    let totalUniqueSessions = 0;
    let totalApplause = 0;
    let totalTimeSpentSeconds = 0;
    let totalCompletionSum = 0;

    for (const art of articles) {
      totalViews += art.viewCount;
      totalUniqueSessions += art.analytics.length;
      totalApplause += art.applauseCount;
      for (const a of art.analytics) {
        totalTimeSpentSeconds += a.timeSpentSeconds;
        totalCompletionSum += a.readCompletionPercent;
      }
    }

    const averageCompletionRate =
      totalUniqueSessions > 0 ? Math.round((totalCompletionSum / totalUniqueSessions) * 10) / 10 : 0;
    const totalReadingMinutes = Math.round(totalTimeSpentSeconds / 60);

    const topArticles = articles.slice(0, 5).map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      publishedAt: art.publishedAt,
      views: art.viewCount,
      uniqueSessions: art.analytics.length,
      applause: art.applauseCount,
      readingTimeMinutes: art.readingTimeMinutes,
    }));

    return {
      metrics: {
        totalArticles: articles.length,
        totalViews,
        totalUniqueSessions,
        totalApplause,
        totalReadingMinutes,
        averageCompletionRate,
      },
      topArticles,
    };
  }
}
