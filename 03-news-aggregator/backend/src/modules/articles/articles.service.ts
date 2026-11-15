import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QueryArticlesDto, SaveArticleDto, RecordReadingDto } from './articles.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async listArticles(dto: QueryArticlesDto, userId?: string) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.category) {
      where.category = dto.category.toLowerCase();
    }

    if (dto.sourceSlug) {
      where.source = { slug: dto.sourceSlug };
    }

    if (dto.isBreaking !== undefined) {
      where.isBreaking = dto.isBreaking;
    }

    if (dto.q) {
      const searchTerms = dto.q.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: 'insensitive' } },
        { excerpt: { contains: searchTerms, mode: 'insensitive' } },
      ];
    }

    const [total, articles] = await Promise.all([
      this.prisma.newsArticle.count({ where }),
      this.prisma.newsArticle.findMany({
        where,
        include: {
          source: {
            select: {
              id: true,
              name: true,
              slug: true,
              websiteUrl: true,
              logoUrl: true,
            },
          },
          cluster: {
            select: {
              id: true,
              title: true,
              articleCount: true,
              isBreaking: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    let savedArticleIds = new Set<string>();
    if (userId) {
      const saved = await this.prisma.savedArticle.findMany({
        where: {
          userId,
          articleId: { in: articles.map((a) => a.id) },
        },
        select: { articleId: true },
      });
      savedArticleIds = new Set(saved.map((s) => s.articleId));
    }

    const items = articles.map((a) => ({
      ...a,
      isSaved: savedArticleIds.has(a.id),
    }));

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getArticleById(id: string, userId?: string) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id },
      include: {
        source: true,
        cluster: {
          include: {
            articles: {
              where: { id: { not: id } },
              include: { source: true },
              take: 5,
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    let isSaved = false;
    let savedNotes: string | null = null;
    if (userId) {
      const saved = await this.prisma.savedArticle.findUnique({
        where: { userId_articleId: { userId, articleId: id } },
      });
      if (saved) {
        isSaved = true;
        savedNotes = saved.notes;
      }
    }

    return {
      ...article,
      isSaved,
      savedNotes,
    };
  }

  async saveArticle(userId: string, articleId: string, dto: SaveArticleDto) {
    const article = await this.prisma.newsArticle.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.savedArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: { notes: dto.notes },
      create: {
        userId,
        articleId,
        notes: dto.notes,
      },
      include: {
        article: {
          include: { source: true },
        },
      },
    });
  }

  async unsaveArticle(userId: string, articleId: string) {
    const existing = await this.prisma.savedArticle.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (!existing) {
      return { success: true };
    }

    await this.prisma.savedArticle.delete({
      where: { id: existing.id },
    });
    return { success: true };
  }

  async listSavedArticles(userId: string) {
    return this.prisma.savedArticle.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            source: true,
            cluster: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
  }

  async recordReading(userId: string, articleId: string, dto: RecordReadingDto) {
    return this.prisma.readingHistory.create({
      data: {
        userId,
        articleId,
        durationSeconds: dto.durationSeconds,
      },
    });
  }

  async listReadingHistory(userId: string) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      include: {
        article: {
          include: { source: true },
        },
      },
      orderBy: { readAt: 'desc' },
      take: 50,
    });
  }

  async getTrendingArticles(limit: number = 6) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000);

    return this.prisma.newsArticle.findMany({
      where: {
        publishedAt: { gte: fortyEightHoursAgo },
      },
      include: {
        source: true,
        cluster: true,
      },
      orderBy: [
        { isBreaking: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });
  }
}
