import { rankRecipesByIngredients, RecipeForSearch } from './ingredient-search.util';

describe('Ingredient-Based Search Ranking', () => {
  const recipes: RecipeForSearch[] = [
    {
      id: 'rec-1',
      title: 'Roman Rigatoni alla Carbonara',
      slug: 'carbonara',
      coverImageUrl: 'http://pixlo.local/carbonara.jpg',
      servings: 4,
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      totalTimeMinutes: 30,
      difficulty: 'MEDIUM',
      ingredients: [
        { canonicalName: 'Rigatoni Pasta' },
        { canonicalName: 'Guanciale' },
        { canonicalName: 'Egg Yolks' },
        { canonicalName: 'Pecorino Romano' },
        { canonicalName: 'Black Pepper' },
      ],
    },
    {
      id: 'rec-2',
      title: 'Artisan Country Sourdough',
      slug: 'sourdough',
      coverImageUrl: 'http://pixlo.local/sourdough.jpg',
      servings: 10,
      prepTimeMinutes: 45,
      cookTimeMinutes: 45,
      totalTimeMinutes: 90,
      difficulty: 'HARD',
      ingredients: [
        { canonicalName: 'Bread Flour' },
        { canonicalName: 'Water' },
        { canonicalName: 'Sourdough Starter' },
        { canonicalName: 'Sea Salt' },
      ],
    },
  ];

  it('ranks recipe with higher match percentage first and lists missing ingredients', () => {
    // User has egg yolks, pecorino romano, and black pepper (3 out of 5 for carbonara = 60%)
    const userIngredients = ['egg yolks', 'pecorino romano', 'black pepper'];

    const ranked = rankRecipesByIngredients(recipes, userIngredients);

    expect(ranked.length).toBe(1); // Only carbonara matches
    expect(ranked[0].recipe.slug).toBe('carbonara');
    expect(ranked[0].matchScore).toBe(0.6);
    expect(ranked[0].matchedCount).toBe(3);
    expect(ranked[0].totalCount).toBe(5);
    expect(ranked[0].missingIngredients).toEqual(['Rigatoni Pasta', 'Guanciale']);
  });
});
