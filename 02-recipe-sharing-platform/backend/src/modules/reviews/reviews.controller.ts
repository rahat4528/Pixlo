import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SubmitRatingDto, SubmitReviewDto } from './reviews.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CookUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('recipes/:id/ratings')
  @UseGuards(JwtAuthGuard)
  async rate(
    @Param('id') recipeId: string,
    @CurrentUser() user: CookUserPayload,
    @Body() dto: SubmitRatingDto,
  ) {
    const data = await this.reviewsService.submitOrUpdateRating(recipeId, user.userId, dto);
    return { success: true, data, message: 'Rating saved' };
  }

  @Post('recipes/:id')
  @UseGuards(JwtAuthGuard)
  async review(
    @Param('id') recipeId: string,
    @CurrentUser() user: CookUserPayload,
    @Body() dto: SubmitReviewDto,
  ) {
    const data = await this.reviewsService.submitReview(recipeId, user.userId, dto);
    return { success: true, data, message: 'Review submitted' };
  }

  @Get('recipes/:id')
  async getReviews(@Param('id') recipeId: string) {
    const data = await this.reviewsService.getReviews(recipeId);
    return { success: true, data };
  }
}
