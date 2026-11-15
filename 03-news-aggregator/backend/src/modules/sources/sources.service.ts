import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSourceDto, UpdateSourceStatusDto } from './sources.dto';
import { SSRFGuard } from '../../../../ingestion/ssrf-guard';
import { SourceStatus } from '@prisma/client';

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async listSources(status?: SourceStatus, category?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    return this.prisma.newsSource.findMany({
      where,
      include: {
        feedSources: true,
        _count: {
          select: {
            articles: true,
            followers: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSourceBySlug(slug: string, userId?: string) {
    const source = await this.prisma.newsSource.findUnique({
      where: { slug },
      include: {
        feedSources: true,
        articles: {
          orderBy: { publishedAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            articles: true,
            followers: true,
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException(`News source with slug '${slug}' not found`);
    }

    let isFollowed = false;
    if (userId) {
      const follow = await this.prisma.followedSource.findUnique({
        where: {
          userId_sourceId: {
            userId,
            sourceId: source.id,
          },
        },
      });
      isFollowed = !!follow;
    }

    return { ...source, isFollowed };
  }

  async createSource(dto: CreateSourceDto) {
    // 1. SSRF check on feed URL
    const ssrfCheck = await SSRFGuard.validateUrl(dto.feedUrl);
    if (!ssrfCheck.isSafe) {
      throw new BadRequestException(`Feed URL rejected: ${ssrfCheck.error}`);
    }

    // 2. Check slug / name conflict
    const existing = await this.prisma.newsSource.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`News source with slug '${dto.slug}' already exists`);
    }

    // 3. Create Source & Feed
    return this.prisma.newsSource.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        websiteUrl: dto.websiteUrl,
        logoUrl: dto.logoUrl,
        description: dto.description,
        category: dto.category.toLowerCase(),
        status: SourceStatus.ACTIVE,
        feedSources: {
          create: {
            url: dto.feedUrl,
            format: dto.format || 'RSS',
            refreshIntervalMinutes: dto.refreshIntervalMinutes || 15,
            isActive: true,
          },
        },
      },
      include: {
        feedSources: true,
      },
    });
  }

  async updateSourceStatus(id: string, dto: UpdateSourceStatusDto) {
    const source = await this.prisma.newsSource.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException('News source not found');
    }

    const resetFailures = dto.status === SourceStatus.ACTIVE ? { consecutiveFailures: 0 } : {};

    return this.prisma.newsSource.update({
      where: { id },
      data: {
        status: dto.status,
        ...resetFailures,
      },
    });
  }

  async toggleFollowSource(userId: string, sourceId: string) {
    const existing = await this.prisma.followedSource.findUnique({
      where: {
        userId_sourceId: {
          userId,
          sourceId,
        },
      },
    });

    if (existing) {
      await this.prisma.followedSource.delete({
        where: { id: existing.id },
      });
      return { followed: false };
    } else {
      await this.prisma.followedSource.create({
        data: {
          userId,
          sourceId,
        },
      });
      return { followed: true };
    }
  }

  async getCategories() {
    return this.prisma.articleCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getTopics() {
    return this.prisma.articleTopic.findMany({
      orderBy: { articleCount: 'desc' },
      take: 20,
    });
  }
}
