import { ReviewsService } from './reviews.service';

describe('ReviewsService (Rating Uniqueness & Aggregation)', () => {
  let service: ReviewsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      recipe: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      recipeRating: {
        upsert: jest.fn(),
        aggregate: jest.fn(),
      },
      recipeReview: {
        create: jest.fn(),
      },
    };
    service = new ReviewsService(mockPrisma);
  });

  it('enforces one rating per user per recipe by upserting on composite unique key', async () => {
    mockPrisma.recipe.findUnique.mockResolvedValue({ id: 'rec-1' });
    mockPrisma.recipeRating.upsert.mockResolvedValue({ id: 'rating-1', rating: 5 });
    mockPrisma.recipeRating.aggregate.mockResolvedValue({
      _avg: { rating: 4.8 },
      _count: { rating: 12 },
    });
    mockPrisma.recipe.update.mockResolvedValue({});

    await service.submitOrUpdateRating('rec-1', 'user-leo', { rating: 5 });

    expect(mockPrisma.recipeRating.upsert).toHaveBeenCalledWith({
      where: {
        recipeId_userId: {
          recipeId: 'rec-1',
          userId: 'user-leo',
        },
      },
      create: { recipeId: 'rec-1', userId: 'user-leo', rating: 5 },
      update: { rating: 5 },
    });

    expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
      where: { id: 'rec-1' },
      data: {
        averageRating: 4.8,
        ratingsCount: 12,
      },
    });
  });
});
