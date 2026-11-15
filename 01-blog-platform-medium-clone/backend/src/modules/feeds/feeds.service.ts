import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ArticleStatus } from '@prisma/client';
import { scoreArticleForUser, UserAffinityProfile } from '../../common/feed-scoring.util';

@Injectable()
export class FeedsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDiscoveryArticles(params: {
    page?: number;
    limit?: number;
    tag?: string;
    category?: string;
    author?: string;
    sort?: 'latest' | 'top' | 'trending';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (params.tag) {
      where.tags = {
        some: {
          tag: { slug: params.tag.toLowerCase() },
        },
      };
    }

    if (params.category) {
      where.category = {
        slug: params.category.toLowerCase(),
      };
    }

    if (params.author) {
      where.author = {
        profile: { username: params.author.toLowerCase() },
      };
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (params.sort === 'top') {
      orderBy = { applauseCount: 'desc' };
    } else if (params.sort === 'trending') {
      orderBy = { viewCount: 'desc' };
    }

    const [articles, totalCount] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          readingTimeMinutes: true,
          isMembersOnly: true,
          viewCount: true,
          applauseCount: true,
          author: { select: { id: true, profile: true } },
          publication: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      items: articles,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getPersonalizedFeed(userId: string, limit: number = 20) {
    // 1. Gather User Affinity Profile
    const [follows, readingHistory] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followeeId: true },
      }),
      this.prisma.readingHistory.findMany({
        where: { userId },
        take: 50,
        select: {
          article: {
            select: {
              tags: { select: { tagId: true } },
            },
          },
        },
      }),
    ]);

    const followedAuthorIds = new Set(follows.map((f) => f.followeeId));
    const preferredTagIds = new Map<string, number>();

    for (const h of readingHistory) {
      for (const t of h.article.tags) {
        preferredTagIds.set(t.tagId, (preferredTagIds.get(t.tagId) || 0) + 1);
      }
    }

    const affinity: UserAffinityProfile = {
      followedAuthorIds,
      followedPublicationIds: new Set<string>(),
      preferredTagIds,
    };

    // 2. Fetch candidate recent published articles
    const candidates = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      take: 100,
      select: {
        id: true,
        authorId: true,
        publicationId: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTimeMinutes: true,
        isMembersOnly: true,
        viewCount: true,
        applauseCount: true,
        author: { select: { id: true, profile: true } },
        publication: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    // 3. Score each article using the deterministic scoring engine
    const scored = candidates.map((article) => {
      const tagIds = article.tags.map((t) => t.tag.id);
      const score = scoreArticleForUser(
        {
          articleId: article.id,
          authorId: article.authorId,
          publicationId: article.publicationId,
          tagIds,
          publishedAt: article.publishedAt || new Date(),
          viewCount: article.viewCount,
          applauseCount: article.applauseCount,
        },
        affinity
      );
      return { article, score };
    });

    // 4. Sort by score desc
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => ({
      ...s.article,
      personalizedScore: s.score,
    }));
  }

  async searchArticles(query: string, limit: number = 20) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.trim();

    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { excerpt: { contains: cleanQuery, mode: 'insensitive' } },
          { htmlContent: { contains: cleanQuery, mode: 'insensitive' } },
          { tags: { some: { tag: { name: { contains: cleanQuery, mode: 'insensitive' } } } } },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTimeMinutes: true,
        author: { select: { id: true, profile: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { articles: { where: { status: ArticleStatus.PUBLISHED } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTags() {
    return this.prisma.tag.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
      take: 50,
    });
  }
}
