import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AddReactionDto, CreateCommentDto, ModerateCommentDto, RecordReadingHistoryDto, CreateReadingListDto } from './engagement.dto';
import { sanitizeComment } from '../../common/sanitize.util';
import { PublicationRole } from '@prisma/client';

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Reactions
  async addOrUpdateReaction(articleId: string, userId: string, dto: AddReactionDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    const reaction = await this.prisma.reaction.upsert({
      where: {
        articleId_userId_type: {
          articleId,
          userId,
          type: dto.type,
        },
      },
      create: {
        articleId,
        userId,
        type: dto.type,
        count: Math.min(50, dto.count),
      },
      update: {
        count: Math.min(50, dto.count),
      },
    });

    // Update aggregate applause count on article if reaction is APPLAUSE
    if (dto.type === 'APPLAUSE') {
      const aggregates = await this.prisma.reaction.aggregate({
        where: { articleId, type: 'APPLAUSE' },
        _sum: { count: true },
      });
      await this.prisma.article.update({
        where: { id: articleId },
        data: { applauseCount: aggregates._sum.count || 0 },
      });
    }

    return reaction;
  }

  // 2. Comments
  async getComments(articleId: string) {
    return this.prisma.comment.findMany({
      where: {
        articleId,
        parentId: null, // Top-level
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        replies: {
          include: {
            author: { select: { id: true, email: true, profile: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComment(articleId: string, authorId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.articleId !== articleId) {
        throw new BadRequestException('Invalid parent comment');
      }
    }

    const cleanContent = sanitizeComment(dto.content);
    if (!cleanContent || cleanContent.length === 0) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    return this.prisma.comment.create({
      data: {
        articleId,
        authorId,
        parentId: dto.parentId || null,
        content: cleanContent,
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
      },
    });
  }

  async moderateComment(commentId: string, actorId: string, dto: ModerateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        article: {
          include: {
            publication: { include: { members: true } },
          },
        },
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const isArticleAuthor = comment.article.authorId === actorId;
    const isPubEditor = comment.article.publication?.members.some(
      (m) => m.userId === actorId && (m.role === PublicationRole.OWNER || m.role === PublicationRole.EDITOR)
    );

    if (!isArticleAuthor && !isPubEditor) {
      throw new ForbiddenException('Only article authors or publication editors can moderate comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isModerated: true,
        moderationReason: dto.reason,
      },
    });
  }

  // 3. Bookmarks
  async toggleBookmark(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    const existing = await this.prisma.bookmark.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: { articleId, userId },
    });
    return { bookmarked: true };
  }

  async getBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImageUrl: true,
            publishedAt: true,
            readingTimeMinutes: true,
            author: { select: { id: true, profile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. Reading History
  async recordReadingHistory(articleId: string, userId: string, dto: RecordReadingHistoryDto) {
    return this.prisma.readingHistory.upsert({
      where: {
        articleId_userId: { articleId, userId },
      },
      create: {
        articleId,
        userId,
        readPercent: dto.readPercent,
        scrollDepth: dto.scrollDepth,
        timeSpentSeconds: dto.timeSpentSeconds,
      },
      update: {
        readPercent: Math.max(dto.readPercent),
        scrollDepth: Math.max(dto.scrollDepth),
        timeSpentSeconds: { increment: dto.timeSpentSeconds },
      },
    });
  }

  async getReadingHistory(userId: string) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImageUrl: true,
            publishedAt: true,
            readingTimeMinutes: true,
            author: { select: { id: true, profile: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  // 5. Reading Lists
  async createReadingList(userId: string, dto: CreateReadingListDto) {
    return this.prisma.readingList.create({
      data: {
        userId,
        name: dto.name,
        isPrivate: dto.isPrivate ?? false,
      },
    });
  }

  async addArticleToReadingList(listId: string, articleId: string, userId: string) {
    const list = await this.prisma.readingList.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('Reading list not found');
    if (list.userId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.readingListItem.create({
      data: {
        readingListId: listId,
        articleId,
      },
    });
  }
}
