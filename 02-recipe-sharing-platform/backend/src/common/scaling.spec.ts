import { scaleIngredient, scaleRecipeIngredients, ScalableIngredient } from './scaling.util';
import { UnitDimension } from '@prisma/client';

describe('Recipe Serving Scaling Engine', () => {
  const pepper: ScalableIngredient = {
    name: 'Coarse Black Pepper',
    amountNumerator: 3,
    amountDenominator: 2, // 1 1/2 tsp
    unit: 'tsp',
    unitDimension: UnitDimension.VOLUME,
    isScalable: true,
  };

  const pasta: ScalableIngredient = {
    name: 'Rigatoni',
    amountNumerator: 400,
    amountDenominator: 1, // 400g
    unit: 'g',
    unitDimension: UnitDimension.MASS,
    isScalable: true,
  };

  const salt: ScalableIngredient = {
    name: 'Sea salt',
    amountNumerator: 0,
    amountDenominator: 1,
    unit: 'to taste',
    unitDimension: UnitDimension.ARBITRARY,
    isScalable: false,
  };

  it('doubles ingredient quantities when scaling from 4 to 8 servings', () => {
    // 1 1/2 tsp * (8/4) = 3 tsp
    const scaledPepper = scaleIngredient(pepper, 4, 8);
    expect(scaledPepper.isScaled).toBe(true);
    expect(scaledPepper.scaledNumerator).toBe(3);
    expect(scaledPepper.scaledDenominator).toBe(1);
    expect(scaledPepper.displayQuantity).toBe('3');

    // 400g * (8/4) = 800g
    const scaledPasta = scaleIngredient(pasta, 4, 8);
    expect(scaledPasta.isScaled).toBe(true);
    expect(scaledPasta.displayQuantity).toBe('800');
  });

  it('halves ingredient quantities into exact natural fractions when scaling from 4 to 2 servings', () => {
    // 1 1/2 tsp * (2/4) = (3/2) * (1/2) = 3/4 tsp
    const scaledPepper = scaleIngredient(pepper, 4, 2);
    expect(scaledPepper.scaledNumerator).toBe(3);
    expect(scaledPepper.scaledDenominator).toBe(4);
    expect(scaledPepper.displayQuantity).toBe('3/4');

    // 400g * (2/4) = 200g
    const scaledPasta = scaleIngredient(pasta, 4, 2);
    expect(scaledPasta.displayQuantity).toBe('200');
  });

  it('preserves non-scalable items like "to taste" without multiplying amounts', () => {
    const scaledSalt = scaleIngredient(salt, 4, 12);
    expect(scaledSalt.isScaled).toBe(false);
    expect(scaledSalt.displayQuantity).toBe('to taste');
  });

  it('handles fractional multiplier (e.g. 4 servings to 6 servings = 1.5x)', () => {
    // 1 1/2 tsp * (6/4) = (3/2) * (3/2) = 9/4 = 2 1/4 tsp
    const scaledPepper = scaleIngredient(pepper, 4, 6);
    expect(scaledPepper.scaledNumerator).toBe(9);
    expect(scaledPepper.scaledDenominator).toBe(4);
    expect(scaledPepper.displayQuantity).toBe('2 1/4');
  });
});
