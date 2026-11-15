import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePublicationDto, AddMemberDto, EditorialVerdictDto } from './publications.dto';
import { PublicationRole, ArticleStatus, ReviewVerdict } from '@prisma/client';

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createPublication(ownerId: string, dto: CreatePublicationDto) {
    const slug = this.slugify(dto.name);
    const existing = await this.prisma.publication.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('A publication with this name or slug already exists');
    }

    return this.prisma.publication.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || '',
        logoUrl: dto.logoUrl,
        coverImageUrl: dto.coverImageUrl,
        requireReview: dto.requireReview ?? true,
        members: {
          create: {
            userId: ownerId,
            role: PublicationRole.OWNER,
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, email: true, profile: true } } } },
      },
    });
  }

  async getPublicationBySlug(slug: string) {
    const pub = await this.prisma.publication.findUnique({
      where: { slug },
      include: {
        members: { include: { user: { select: { id: true, email: true, profile: true } } } },
        articles: {
          where: { status: ArticleStatus.PUBLISHED },
          include: {
            author: { select: { id: true, email: true, profile: true } },
            tags: { include: { tag: true } },
          },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!pub) {
      throw new NotFoundException('Publication not found');
    }

    return pub;
  }

  async addOrUpdateMember(publicationId: string, actorId: string, dto: AddMemberDto) {
    const membership = await this.prisma.publicationMember.findUnique({
      where: { publicationId_userId: { publicationId, userId: actorId } },
    });

    if (!membership || (membership.role !== PublicationRole.OWNER && membership.role !== PublicationRole.EDITOR)) {
      throw new ForbiddenException('Only publication owners or editors can manage members');
    }

    return this.prisma.publicationMember.upsert({
      where: {
        publicationId_userId: {
          publicationId,
          userId: dto.userId,
        },
      },
      create: {
        publicationId,
        userId: dto.userId,
        role: dto.role,
      },
      update: {
        role: dto.role,
      },
      include: {
        user: { select: { id: true, email: true, profile: true } },
      },
    });
  }

  async getPendingSubmissions(publicationId: string, actorId: string) {
    const membership = await this.prisma.publicationMember.findUnique({
      where: { publicationId_userId: { publicationId, userId: actorId } },
    });

    if (!membership || (membership.role !== PublicationRole.OWNER && membership.role !== PublicationRole.EDITOR)) {
      throw new ForbiddenException('Only publication owners or editors can view review queues');
    }

    return this.prisma.article.findMany({
      where: {
        publicationId,
        status: { in: [ArticleStatus.SUBMITTED, ArticleStatus.IN_REVIEW] },
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        reviews: { orderBy: { reviewedAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async reviewSubmission(publicationId: string, articleId: string, reviewerId: string, dto: EditorialVerdictDto) {
    const membership = await this.prisma.publicationMember.findUnique({
      where: { publicationId_userId: { publicationId, userId: reviewerId } },
    });

    if (!membership || (membership.role !== PublicationRole.OWNER && membership.role !== PublicationRole.EDITOR)) {
      throw new ForbiddenException('Only publication owners or editors can review submissions');
    }

    const article = await this.prisma.article.findFirst({
      where: { id: articleId, publicationId },
    });

    if (!article) {
      throw new NotFoundException('Article not found in this publication');
    }

    const newStatus =
      dto.verdict === ReviewVerdict.APPROVED
        ? ArticleStatus.APPROVED
        : ArticleStatus.CHANGES_REQUESTED;

    await this.prisma.editorialReview.create({
      data: {
        articleId,
        reviewerId,
        status: dto.verdict,
        reviewNotes: dto.reviewNotes || null,
      },
    });

    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: newStatus },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        reviews: { orderBy: { reviewedAt: 'desc' }, take: 1 },
      },
    });
  }
}
