export interface RecipeForSearch {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  difficulty: string;
  cuisine?: { name: string } | null;
  category?: { name: string } | null;
  ingredients: {
    canonicalName: string;
  }[];
}

export interface IngredientMatchResult {
  recipe: RecipeForSearch;
  matchScore: number;
  matchedCount: number;
  totalCount: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

export function rankRecipesByIngredients(
  recipes: RecipeForSearch[],
  availableIngredients: string[]
): IngredientMatchResult[] {
  const normalizedAvailable = new Set(
    availableIngredients.map((i) => i.trim().toLowerCase())
  );

  const scored: IngredientMatchResult[] = [];

  for (const recipe of recipes) {
    const required = recipe.ingredients.map((i) => i.canonicalName);
    const matched: string[] = [];
    const missing: string[] = [];

    for (const name of required) {
      const lower = name.toLowerCase();
      // Check if user has this ingredient or any substring match
      let isMatch = false;
      for (const avail of normalizedAvailable) {
        if (lower.includes(avail) || avail.includes(lower)) {
          isMatch = true;
          break;
        }
      }

      if (isMatch) {
        matched.push(name);
      } else {
        missing.push(name);
      }
    }

    const totalCount = required.length;
    const matchedCount = matched.length;
    const matchScore = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) / 100 : 0;

    if (matchedCount > 0) {
      scored.push({
        recipe,
        matchScore,
        matchedCount,
        totalCount,
        matchedIngredients: matched,
        missingIngredients: missing,
      });
    }
  }

  // Sort descending by matchScore
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}
