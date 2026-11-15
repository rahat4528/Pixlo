import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateArticleDto, UpdateArticleDto, TransitionStatusDto } from './articles.dto';
import { ArticleStatus, PublicationRole } from '@prisma/client';
import { sanitizeArticleHtml } from '../../common/sanitize.util';
import { calculateReadingTime } from '../../common/reading-time.util';
import { validateArticleTransition } from './article-state-machine';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${baseSlug}-${randomSuffix}`;
  }

  async createArticle(authorId: string, dto: CreateArticleDto) {
    const slug = this.slugify(dto.title);
    const sanitizedHtml = sanitizeArticleHtml(dto.htmlContent || '');
    const readingTime = calculateReadingTime(dto.content || sanitizedHtml);

    // Verify publication membership if specified
    if (dto.publicationId) {
      const membership = await this.prisma.publicationMember.findUnique({
        where: {
          publicationId_userId: {
            publicationId: dto.publicationId,
            userId: authorId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('User is not a member of the target publication');
      }
    }

    const article = await this.prisma.article.create({
      data: {
        authorId,
        publicationId: dto.publicationId,
        categoryId: dto.categoryId,
        title: dto.title,
        slug,
        excerpt: dto.excerpt || '',
        content: dto.content || {},
        htmlContent: sanitizedHtml,
        coverImageUrl: dto.coverImageUrl,
        status: ArticleStatus.DRAFT,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        readingTimeMinutes: readingTime,
        isMembersOnly: dto.isMembersOnly || false,
        revisions: {
          create: {
            version: 1,
            title: dto.title,
            content: dto.content || {},
            summary: 'Initial draft',
            createdBy: authorId,
          },
        },
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        publication: true,
        category: true,
        revisions: true,
      },
    });

    if (dto.tagNames && dto.tagNames.length > 0) {
      for (const rawTag of dto.tagNames) {
        const cleanTag = rawTag.trim().toLowerCase();
        const tagSlug = cleanTag.replace(/\s+/g, '-');
        const tag = await this.prisma.tag.upsert({
          where: { slug: tagSlug },
          create: { name: cleanTag, slug: tagSlug },
          update: {},
        });
        await this.prisma.articleTag.create({
          data: { articleId: article.id, tagId: tag.id },
        });
      }
    }

    return article;
  }

  async updateArticle(articleId: string, userId: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publication: { include: { members: true } },
        revisions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const isAuthor = article.authorId === userId;
    const userPubRole = article.publication?.members.find((m) => m.userId === userId)?.role;
    const isEditorOrOwner = userPubRole === PublicationRole.EDITOR || userPubRole === PublicationRole.OWNER;

    if (!isAuthor && !isEditorOrOwner) {
      throw new ForbiddenException('Not authorized to edit this article');
    }

    const sanitizedHtml = dto.htmlContent !== undefined ? sanitizeArticleHtml(dto.htmlContent) : article.htmlContent;
    const readingTime = dto.content ? calculateReadingTime(dto.content || sanitizedHtml) : article.readingTimeMinutes;

    const latestVersion = article.revisions[0]?.version || 0;
    const nextVersion = latestVersion + 1;

    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.content && { content: dto.content }),
        ...(dto.htmlContent !== undefined && { htmlContent: sanitizedHtml }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isMembersOnly !== undefined && { isMembersOnly: dto.isMembersOnly }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }),
        readingTimeMinutes: readingTime,
        revisions: {
          create: {
            version: nextVersion,
            title: dto.title || article.title,
            content: dto.content || article.content,
            summary: dto.revisionSummary || `Revision ${nextVersion}`,
            createdBy: userId,
          },
        },
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        publication: true,
        category: true,
        tags: { include: { tag: true } },
        revisions: { orderBy: { version: 'desc' } },
      },
    });

    return updated;
  }

  async getArticleBySlug(slug: string, currentUserId?: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        publication: { include: { members: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const isAuthor = currentUserId === article.authorId;
    const userPubRole = currentUserId
      ? article.publication?.members.find((m) => m.userId === currentUserId)?.role
      : null;
    const isEditorOrOwner = userPubRole === PublicationRole.EDITOR || userPubRole === PublicationRole.OWNER;

    // DRAFT PRIVACY: Non-published articles can ONLY be viewed by the author or publication editor/owner
    if (article.status !== ArticleStatus.PUBLISHED) {
      if (!currentUserId || (!isAuthor && !isEditorOrOwner)) {
        throw new NotFoundException('Article not found or not published');
      }
    }

    // SERVER-SIDE PAYWALL ENFORCEMENT
    let isLocked = false;
    let teaserHtml: string | null = null;
    let contentToReturn: any = article.content;
    let htmlToReturn = article.htmlContent;

    if (article.isMembersOnly && !isAuthor && !isEditorOrOwner) {
      let hasActiveMembership = false;
      if (currentUserId) {
        const membership = await this.prisma.membership.findFirst({
          where: {
            userId: currentUserId,
            status: 'ACTIVE',
            OR: [
              { targetAuthorId: article.authorId },
              { targetPublicationId: article.publicationId },
            ],
          },
        });
        if (membership) {
          hasActiveMembership = true;
        }
      }

      if (!hasActiveMembership) {
        isLocked = true;
        // Truncate to maximum 2 paragraphs for teaser
        const paragraphs = article.htmlContent.match(/<p>[\s\S]*?<\/p>/gi) || [];
        teaserHtml = paragraphs.slice(0, 2).join('') || '<p>This story is exclusively available to members.</p>';
        contentToReturn = null; // Strictly excluded on server
        htmlToReturn = teaserHtml;
      }
    }

    return {
      ...article,
      content: contentToReturn,
      htmlContent: htmlToReturn,
      isLocked,
      teaserHtml,
    };
  }

  async transitionStatus(articleId: string, userId: string, dto: TransitionStatusDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publication: { include: { members: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const isAuthor = article.authorId === userId;
    const pubMember = article.publication?.members.find((m) => m.userId === userId);
    const publicationRole = pubMember?.role;
    const requiresReview = article.publication?.requireReview ?? false;

    // Validate state machine rule
    validateArticleTransition({
      currentStatus: article.status,
      targetStatus: dto.targetStatus,
      isAuthor,
      publicationRole,
      requiresReview,
      hasScheduledDate: !!dto.scheduledAt || !!article.scheduledAt,
    });

    const updateData: any = {
      status: dto.targetStatus,
    };

    if (dto.targetStatus === ArticleStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    } else if (dto.targetStatus === ArticleStatus.SCHEDULED) {
      updateData.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : article.scheduledAt;
    }

    if (dto.reviewNotes || dto.targetStatus === ArticleStatus.IN_REVIEW || dto.targetStatus === ArticleStatus.APPROVED || dto.targetStatus === ArticleStatus.CHANGES_REQUESTED) {
      await this.prisma.editorialReview.create({
        data: {
          articleId: article.id,
          reviewerId: userId,
          status: dto.targetStatus === ArticleStatus.APPROVED
            ? 'APPROVED'
            : dto.targetStatus === ArticleStatus.CHANGES_REQUESTED
            ? 'CHANGES_REQUESTED'
            : 'PENDING',
          reviewNotes: dto.reviewNotes || null,
        },
      });
    }

    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: {
        author: { select: { id: true, email: true, profile: true } },
        publication: true,
        reviews: { orderBy: { reviewedAt: 'desc' }, take: 1 },
      },
    });

    return updated;
  }

  async getRevisions(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { publication: { include: { members: true } } },
    });

    if (!article) throw new NotFoundException('Article not found');

    const isAuthor = article.authorId === userId;
    const isEditorOrOwner = article.publication?.members.some(
      (m) => m.userId === userId && (m.role === PublicationRole.EDITOR || m.role === PublicationRole.OWNER)
    );

    if (!isAuthor && !isEditorOrOwner) {
      throw new ForbiddenException('Not authorized to view article revisions');
    }

    return this.prisma.articleRevision.findMany({
      where: { articleId },
      orderBy: { version: 'desc' },
    });
  }

  async restoreRevision(articleId: string, version: number, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publication: { include: { members: true } },
        revisions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!article) throw new NotFoundException('Article not found');

    const isAuthor = article.authorId === userId;
    const isEditorOrOwner = article.publication?.members.some(
      (m) => m.userId === userId && (m.role === PublicationRole.EDITOR || m.role === PublicationRole.OWNER)
    );

    if (!isAuthor && !isEditorOrOwner) {
      throw new ForbiddenException('Not authorized to restore revisions');
    }

    const targetRevision = await this.prisma.articleRevision.findUnique({
      where: { articleId_version: { articleId, version } },
    });

    if (!targetRevision) {
      throw new NotFoundException(`Revision v${version} not found`);
    }

    const latestVersion = article.revisions[0]?.version || 0;
    const newVersion = latestVersion + 1;

    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        title: targetRevision.title,
        content: targetRevision.content as any,
        revisions: {
          create: {
            version: newVersion,
            title: targetRevision.title,
            content: targetRevision.content as any,
            summary: `Restored from revision v${version}`,
            createdBy: userId,
          },
        },
      },
      include: { revisions: { orderBy: { version: 'desc' } } },
    });

    return updated;
  }

  async runScheduledPublishJob(now: Date = new Date()) {
    const dueArticles = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.SCHEDULED,
        scheduledAt: { lte: now },
      },
    });

    const publishedIds: string[] = [];
    for (const art of dueArticles) {
      await this.prisma.article.update({
        where: { id: art.id },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: now,
        },
      });
      publishedIds.push(art.id);
    }

    return { processedCount: publishedIds.length, publishedIds };
  }
}
