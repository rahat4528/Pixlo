import { AnalyticsService } from './analytics.service';

describe('AnalyticsService (Deduplication & Author Dashboard)', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      article: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      articleAnalytics: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new AnalyticsService(mockPrisma);
  });

  it('increments article viewCount for new unique visitor session', async () => {
    mockPrisma.article.findUnique.mockResolvedValue({ id: 'art-1', viewCount: 10 });
    mockPrisma.articleAnalytics.findUnique.mockResolvedValue(null); // Not viewed yet in this session
    mockPrisma.articleAnalytics.create.mockResolvedValue({ id: 'stat-1' });
    mockPrisma.article.update.mockResolvedValue({ id: 'art-1', viewCount: 11 });

    await service.recordView('art-1', {
      sessionId: 'session-xyz',
      readCompletionPercent: 50,
      timeSpentSeconds: 60,
    });

    expect(mockPrisma.articleAnalytics.create).toHaveBeenCalled();
    expect(mockPrisma.article.update).toHaveBeenCalledWith({
      where: { id: 'art-1' },
      data: { viewCount: { increment: 1 } },
    });
  });

  it('deduplicates repeat events from same session without incrementing viewCount', async () => {
    mockPrisma.article.findUnique.mockResolvedValue({ id: 'art-1', viewCount: 11 });
    mockPrisma.articleAnalytics.findUnique.mockResolvedValue({
      id: 'stat-1',
      articleId: 'art-1',
      sessionId: 'session-xyz',
      readCompletionPercent: 50,
      timeSpentSeconds: 60,
    });
    mockPrisma.articleAnalytics.update.mockResolvedValue({
      id: 'stat-1',
      readCompletionPercent: 90,
      timeSpentSeconds: 120,
    });

    await service.recordView('art-1', {
      sessionId: 'session-xyz',
      readCompletionPercent: 90,
      timeSpentSeconds: 60,
    });

    // Should update existing analytics entry
    expect(mockPrisma.articleAnalytics.update).toHaveBeenCalled();
    // But MUST NOT increment article view count again!
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it('aggregates author dashboard metrics accurately', async () => {
    mockPrisma.article.findMany.mockResolvedValue([
      {
        id: 'art-1',
        title: 'Article 1',
        slug: 'article-1',
        publishedAt: new Date(),
        viewCount: 100,
        applauseCount: 50,
        readingTimeMinutes: 4,
        analytics: [
          { timeSpentSeconds: 120, readCompletionPercent: 80 },
          { timeSpentSeconds: 180, readCompletionPercent: 100 },
        ],
      },
    ]);

    const dashboard = await service.getAuthorDashboard('author-1');

    expect(dashboard.metrics.totalArticles).toBe(1);
    expect(dashboard.metrics.totalViews).toBe(100);
    expect(dashboard.metrics.totalUniqueSessions).toBe(2);
    expect(dashboard.metrics.totalApplause).toBe(50);
    expect(dashboard.metrics.averageCompletionRate).toBe(90);
    expect(dashboard.metrics.totalReadingMinutes).toBe(5); // (120+180)/60 = 5
  });
});
