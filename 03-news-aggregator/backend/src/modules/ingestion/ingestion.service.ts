import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { IngestionWorker } from '../../../../workers/ingestion-worker';
import { JobStatus, SourceStatus } from '@prisma/client';
import { QueryJobsDto } from './ingestion.dto';

@Injectable()
export class IngestionService {
  constructor(private prisma: PrismaService) {}

  async listJobs(dto: QueryJobsDto) {
    const where: any = {};
    if (dto.status) where.status = dto.status;
    if (dto.feedSourceId) where.feedSourceId = dto.feedSourceId;

    return this.prisma.ingestionJob.findMany({
      where,
      include: {
        feedSource: {
          include: { source: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async listErrors(resolved: boolean = false) {
    return this.prisma.ingestionError.findMany({
      where: { resolved },
      include: {
        feedSource: {
          include: { source: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async ingestFeed(feedSourceId: string) {
    const feed = await this.prisma.feedSource.findUnique({
      where: { id: feedSourceId },
      include: { source: true },
    });

    if (!feed) {
      throw new NotFoundException(`FeedSource with ID '${feedSourceId}' not found`);
    }

    if (feed.source.status === SourceStatus.SUSPENDED) {
      throw new BadRequestException(
        `Publisher '${feed.source.name}' is currently SUSPENDED due to repeated ingestion failures. Please resume the source before ingesting.`,
      );
    }

    // 1. Create Ingestion Job Record (RUNNING)
    const job = await this.prisma.ingestionJob.create({
      data: {
        feedSourceId: feed.id,
        status: JobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    // 2. Execute Ingestion via Worker
    const result = await IngestionWorker.fetchAndParseFeed(feed.url, {
      etag: feed.etag,
      lastModified: feed.lastModified,
    });

    if (!result.success) {
      // Record failure on source
      const newConsecutiveFailures = feed.source.consecutiveFailures + 1;
      const shouldSuspend = newConsecutiveFailures >= IngestionWorker.SUSPENSION_THRESHOLD;

      await this.prisma.newsSource.update({
        where: { id: feed.sourceId },
        data: {
          failureCount: { increment: 1 },
          consecutiveFailures: newConsecutiveFailures,
          status: shouldSuspend ? SourceStatus.SUSPENDED : SourceStatus.ERROR,
        },
      });

      // Calculate backoff
      const nextDelayMs = IngestionWorker.calculateBackoffDelayMs(newConsecutiveFailures);
      const nextRetryAt = new Date(Date.now() + nextDelayMs);

      // Record Ingestion Error
      await this.prisma.ingestionError.create({
        data: {
          feedSourceId: feed.id,
          jobId: job.id,
          errorCode: result.httpStatus ? `HTTP_${result.httpStatus}` : 'INGEST_FETCH_ERROR',
          errorMessage: result.errorMessage || 'Feed ingestion failed',
          retryCount: newConsecutiveFailures,
          nextRetryAt,
        },
      });

      // Update Job status to FAILED
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          errorMessage: result.errorMessage,
        },
      });

      return {
        success: false,
        jobId: job.id,
        errorMessage: result.errorMessage,
        sourceSuspended: shouldSuspend,
        consecutiveFailures: newConsecutiveFailures,
        nextRetryAt,
      };
    }

    // 3. Process items if successful
    let itemsIngested = 0;
    let itemsDuplicated = 0;

    if (!result.isNotModified && result.items.length > 0) {
      for (const item of result.items) {
        // Check for existing article by canonicalUrl or guid
        const existing = await this.prisma.newsArticle.findFirst({
          where: {
            OR: [
              { canonicalUrl: item.canonicalUrl },
              { guid: item.guid },
              { normalizedTitleHash: item.normalizedTitleHash },
            ],
          },
        });

        if (existing) {
          itemsDuplicated++;
          // Ensure mapping exists
          await this.prisma.articleSourceMapping.upsert({
            where: {
              articleId_feedSourceId: {
                articleId: existing.id,
                feedSourceId: feed.id,
              },
            },
            update: {},
            create: {
              articleId: existing.id,
              sourceId: feed.sourceId,
              feedSourceId: feed.id,
            },
          });
          continue;
        }

        // Create new article
        const newArticle = await this.prisma.newsArticle.create({
          data: {
            sourceId: feed.sourceId,
            guid: item.guid,
            title: item.title,
            normalizedTitleHash: item.normalizedTitleHash,
            canonicalUrl: item.canonicalUrl,
            originalUrl: item.originalUrl,
            excerpt: item.excerpt,
            authorName: item.authorName,
            publishedAt: item.publishedAt,
            imageUrl: item.imageUrl,
            category: feed.source.category,
          },
        });

        await this.prisma.articleSourceMapping.create({
          data: {
            articleId: newArticle.id,
            sourceId: feed.sourceId,
            feedSourceId: feed.id,
          },
        });

        itemsIngested++;
      }
    }

    // 4. Update FeedSource headers & Source health
    await this.prisma.feedSource.update({
      where: { id: feed.id },
      data: {
        etag: result.etag || feed.etag,
        lastModified: result.lastModified || feed.lastModified,
      },
    });

    await this.prisma.newsSource.update({
      where: { id: feed.sourceId },
      data: {
        lastFetchedAt: new Date(),
        consecutiveFailures: 0,
        status: SourceStatus.ACTIVE,
      },
    });

    // 5. Complete Ingestion Job
    await this.prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.COMPLETED,
        itemsFound: result.itemsFound,
        itemsIngested,
        itemsDuplicated,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      jobId: job.id,
      itemsFound: result.itemsFound,
      itemsIngested,
      itemsDuplicated,
      isNotModified: result.isNotModified,
    };
  }

  async retryError(errorId: string) {
    const errorRecord = await this.prisma.ingestionError.findUnique({
      where: { id: errorId },
    });

    if (!errorRecord) {
      throw new NotFoundException('Ingestion error record not found');
    }

    const result = await this.ingestFeed(errorRecord.feedSourceId);

    if (result.success) {
      await this.prisma.ingestionError.update({
        where: { id: errorId },
        data: { resolved: true },
      });
    }

    return result;
  }

  async resumeSource(sourceId: string) {
    const source = await this.prisma.newsSource.findUnique({ where: { id: sourceId } });
    if (!source) {
      throw new NotFoundException('News source not found');
    }

    await this.prisma.newsSource.update({
      where: { id: sourceId },
      data: {
        status: SourceStatus.ACTIVE,
        consecutiveFailures: 0,
      },
    });

    // Mark related errors as resolved
    await this.prisma.ingestionError.updateMany({
      where: {
        feedSource: { sourceId },
        resolved: false,
      },
      data: { resolved: true },
    });

    return { success: true, message: `News source '${source.name}' has been resumed.` };
  }
}
