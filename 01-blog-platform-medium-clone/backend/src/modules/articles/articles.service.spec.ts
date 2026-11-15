import { ArticlesService } from './articles.service';
import { ArticleStatus, PublicationRole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService (Draft Privacy, Paywall & Lifecycle)', () => {
  let service: ArticlesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      article: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      tag: { upsert: jest.fn() },
      articleTag: { create: jest.fn() },
      membership: { findFirst: jest.fn() },
      articleRevision: { findMany: jest.fn(), findUnique: jest.fn() },
      editorialReview: { create: jest.fn() },
    };
    service = new ArticlesService(mockPrisma);
  });

  describe('Draft Privacy Enforcement', () => {
    it('blocks unauthenticated public callers from accessing DRAFT articles', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'draft-1',
        authorId: 'author-elena',
        status: ArticleStatus.DRAFT,
        title: 'Draft in Progress',
        content: { type: 'doc' },
        htmlContent: '<p>Secret content</p>',
        publication: null,
      });

      // No user passed (unauthenticated)
      await expect(service.getArticleBySlug('draft-in-progress', undefined)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('blocks non-author users from accessing other authors DRAFT articles', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'draft-1',
        authorId: 'author-elena',
        status: ArticleStatus.DRAFT,
        title: 'Draft in Progress',
        content: { type: 'doc' },
        htmlContent: '<p>Secret content</p>',
        publication: null,
      });

      // User David attempting to view Elena's draft
      await expect(service.getArticleBySlug('draft-in-progress', 'user-david')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permits the original author to access their own DRAFT article', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'draft-1',
        authorId: 'author-elena',
        status: ArticleStatus.DRAFT,
        title: 'Draft in Progress',
        content: { type: 'doc' },
        htmlContent: '<p>Secret content</p>',
        publication: null,
      });

      const result = await service.getArticleBySlug('draft-in-progress', 'author-elena');
      expect(result).toBeDefined();
      expect(result.id).toBe('draft-1');
    });
  });

  describe('Server-Side Paywall Enforcement', () => {
    const paywalledArticle = {
      id: 'paywall-art-1',
      authorId: 'author-elena',
      status: ArticleStatus.PUBLISHED,
      title: 'Advanced Raft Consensus Internals',
      isMembersOnly: true,
      content: { type: 'doc', content: [{ type: 'paragraph', text: 'Proprietary formula' }] },
      htmlContent: '<p>Introductory teaser paragraph 1.</p><p>Teaser paragraph 2.</p><p>Secret premium analysis.</p>',
      publication: null,
    };

    it('strips full content and returns teaser only for unauthenticated readers', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(paywalledArticle);

      const result = await service.getArticleBySlug('advanced-raft-consensus-internals', undefined);

      expect(result.isLocked).toBe(true);
      expect(result.content).toBeNull(); // Strictly removed on server
      expect(result.htmlContent).not.toContain('Secret premium analysis');
      expect(result.htmlContent).toContain('Introductory teaser paragraph 1');
    });

    it('strips full content and locks story for authenticated readers without active membership', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(paywalledArticle);
      mockPrisma.membership.findFirst.mockResolvedValue(null); // No active membership

      const result = await service.getArticleBySlug('advanced-raft-consensus-internals', 'reader-david');

      expect(result.isLocked).toBe(true);
      expect(result.content).toBeNull();
      expect(result.htmlContent).not.toContain('Secret premium analysis');
    });

    it('delivers complete content and unlocked status for authenticated members with active subscription', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(paywalledArticle);
      mockPrisma.membership.findFirst.mockResolvedValue({
        id: 'mem-1',
        userId: 'reader-sarah',
        status: 'ACTIVE',
      });

      const result = await service.getArticleBySlug('advanced-raft-consensus-internals', 'reader-sarah');

      expect(result.isLocked).toBe(false);
      expect(result.content).toBeDefined();
      expect(result.htmlContent).toContain('Secret premium analysis');
    });

    it('delivers complete content to the author even if story is marked members-only', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(paywalledArticle);

      const result = await service.getArticleBySlug('advanced-raft-consensus-internals', 'author-elena');

      expect(result.isLocked).toBe(false);
      expect(result.content).toBeDefined();
      expect(result.htmlContent).toContain('Secret premium analysis');
    });
  });

  describe('Scheduled Publishing Job', () => {
    it('finds and atomically publishes due scheduled articles', async () => {
      const now = new Date();
      mockPrisma.article.findMany.mockResolvedValue([
        { id: 'sched-1', status: ArticleStatus.SCHEDULED, scheduledAt: new Date(now.getTime() - 1000) },
        { id: 'sched-2', status: ArticleStatus.SCHEDULED, scheduledAt: new Date(now.getTime() - 5000) },
      ]);
      mockPrisma.article.update.mockResolvedValue({});

      const outcome = await service.runScheduledPublishJob(now);

      expect(outcome.processedCount).toBe(2);
      expect(outcome.publishedIds).toEqual(['sched-1', 'sched-2']);
      expect(mockPrisma.article.update).toHaveBeenCalledTimes(2);
    });
  });
});
