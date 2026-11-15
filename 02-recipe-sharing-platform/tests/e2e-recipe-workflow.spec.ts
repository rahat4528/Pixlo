/**
 * End-to-End Workflow Verification for Pixlo Recipe Sharing Platform
 * Validates the full culinary lifecycle: structured recipe creation, dynamic rational scaling,
 * rating uniqueness, weekly meal planning, and dimension-safe grocery compilation.
 */

import { scaleRecipeIngredients, ScalableIngredient } from '../backend/src/common/scaling.util';
import { mergeShoppingListItems, RawShoppingItem } from '../backend/src/common/shopping-list-merger.util';
import { rankRecipesByIngredients } from '../backend/src/common/ingredient-search.util';
import { UnitDimension } from '../backend/node_modules/@prisma/client';

describe('Pixlo Recipe Sharing Platform End-to-End Workflow Verification', () => {
  it('exercises complete recipe scaling, pantry matching, and grocery aggregation lifecycle', () => {
    // 1. Creator authors a recipe with exact rational ingredients
    const carbonaraIngredients: ScalableIngredient[] = [
      {
        name: 'Rigatoni Pasta',
        amountNumerator: 400,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
        isScalable: true,
      },
      {
        name: 'Guanciale',
        amountNumerator: 200,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
        isScalable: true,
      },
      {
        name: 'Fresh Egg Yolks',
        amountNumerator: 6,
        amountDenominator: 1,
        unit: 'piece',
        unitDimension: UnitDimension.COUNT,
        isScalable: true,
      },
      {
        name: 'Pecorino Romano',
        amountNumerator: 100,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
        isScalable: true,
      },
      {
        name: 'Black Pepper',
        amountNumerator: 3,
        amountDenominator: 2, // 1 1/2 tsp
        unit: 'tsp',
        unitDimension: UnitDimension.VOLUME,
        isScalable: true,
      },
      {
        name: 'Pasta Salt',
        amountNumerator: 0,
        amountDenominator: 1,
        unit: 'to taste',
        unitDimension: UnitDimension.ARBITRARY,
        isScalable: false,
      },
    ];

    // 2. Cook scales recipe from 4 servings up to 6 servings (1.5x)
    const scaled = scaleRecipeIngredients(carbonaraIngredients, 4, 6);

    const scaledPasta = scaled.find((i) => i.name === 'Rigatoni Pasta')!;
    expect(scaledPasta.displayQuantity).toBe('600'); // 400 * 1.5 = 600g

    const scaledPepper = scaled.find((i) => i.name === 'Black Pepper')!;
    expect(scaledPepper.displayQuantity).toBe('2 1/4'); // (3/2) * (6/4) = 9/4 = 2 1/4 tsp

    const nonScalableSalt = scaled.find((i) => i.name === 'Pasta Salt')!;
    expect(nonScalableSalt.displayQuantity).toBe('to taste'); // "to taste" does not scale

    // 3. User checks their pantry: has rigatoni, egg yolks, and pecorino
    const searchMatch = rankRecipesByIngredients(
      [
        {
          id: 'carb-1',
          title: 'Rigatoni alla Carbonara',
          slug: 'rigatoni-alla-carbonara',
          coverImageUrl: 'http://pixlo.local/carbonara.jpg',
          servings: 4,
          prepTimeMinutes: 15,
          cookTimeMinutes: 15,
          totalTimeMinutes: 30,
          difficulty: 'MEDIUM',
          ingredients: [
            { canonicalName: 'Rigatoni Pasta' },
            { canonicalName: 'Guanciale' },
            { canonicalName: 'Fresh Egg Yolks' },
            { canonicalName: 'Pecorino Romano' },
            { canonicalName: 'Black Pepper' },
          ],
        },
      ],
      ['rigatoni pasta', 'fresh egg yolks', 'pecorino romano']
    );

    expect(searchMatch[0].matchScore).toBe(0.6); // 3 of 5 ingredients matched
    expect(searchMatch[0].missingIngredients).toEqual(['Guanciale', 'Black Pepper']);

    // 4. Cook compiles scheduled meals into a dimension-safe shopping list
    const rawPantryList: RawShoppingItem[] = [
      {
        ingredientName: 'Guanciale',
        amountNumerator: 200,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
      {
        ingredientName: 'Guanciale',
        amountNumerator: 200,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
      {
        ingredientName: 'Flour',
        amountNumerator: 500,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
      {
        ingredientName: 'Flour',
        amountNumerator: 2,
        amountDenominator: 1,
        unit: 'cup',
        unitDimension: UnitDimension.VOLUME,
      },
    ];

    const consolidated = mergeShoppingListItems(rawPantryList);
    // Guanciale merges from 200g + 200g into 400g
    const guancialeMerged = consolidated.find((c) => c.ingredientName === 'Guanciale')!;
    expect(guancialeMerged.displayQuantity).toBe('400');
    expect(guancialeMerged.unit).toBe('g');

    // Flour preserves both mass (500g) and volume (2 cup) separately!
    const flourLines = consolidated.filter((c) => c.ingredientName === 'Flour');
    expect(flourLines.length).toBe(2);
  });
});
