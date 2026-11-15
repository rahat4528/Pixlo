import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SubmitRatingDto, SubmitReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitOrUpdateRating(recipeId: string, userId: string, dto: SubmitRatingDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    // Enforce unique rating per user per recipe via upsert
    const ratingRecord = await this.prisma.recipeRating.upsert({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
      create: {
        recipeId,
        userId,
        rating: dto.rating,
      },
      update: {
        rating: dto.rating,
      },
    });

    // Recompute aggregate average
    const aggregates = await this.prisma.recipeRating.aggregate({
      where: { recipeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: {
        averageRating: Math.round((aggregates._avg.rating || 0) * 10) / 10,
        ratingsCount: aggregates._count.rating || 0,
      },
    });

    return ratingRecord;
  }

  async submitReview(recipeId: string, userId: string, dto: SubmitReviewDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    // Also update/sync user's rating
    await this.submitOrUpdateRating(recipeId, userId, { rating: dto.rating });

    return this.prisma.recipeReview.create({
      data: {
        recipeId,
        userId,
        rating: dto.rating,
        content: dto.content.trim(),
      },
      include: {
        user: { select: { id: true, profile: true } },
      },
    });
  }

  async getReviews(recipeId: string) {
    return this.prisma.recipeReview.findMany({
      where: { recipeId },
      include: {
        user: { select: { id: true, profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
