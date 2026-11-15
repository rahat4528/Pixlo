import { Rational, multiplyRational, formatNaturalFraction, simplifyRational } from './rational-arithmetic.util';
import { UnitDimension } from '@prisma/client';

export interface ScalableIngredient {
  id?: string;
  name: string;
  amountNumerator: number;
  amountDenominator: number;
  unit: string;
  unitDimension: UnitDimension;
  notes?: string | null;
  isScalable?: boolean;
}

export interface ScaledIngredientResult extends ScalableIngredient {
  scaledNumerator: number;
  scaledDenominator: number;
  displayQuantity: string;
  isScaled: boolean;
}

export function scaleIngredient(
  ing: ScalableIngredient,
  baseServings: number,
  targetServings: number,
): ScaledIngredientResult {
  if (baseServings <= 0) throw new Error('Base servings must be greater than zero');
  if (targetServings <= 0) throw new Error('Target servings must be greater than zero');

  // Check if ingredient should not scale (e.g., "to taste", "as needed", or explicitly marked non-scalable)
  const nonScalableUnits = ['to taste', 'as needed', 'pinch to taste', 'optional'];
  const unitLower = (ing.unit || '').trim().toLowerCase();
  const isNonScalable =
    ing.isScalable === false ||
    ing.unitDimension === UnitDimension.ARBITRARY ||
    nonScalableUnits.includes(unitLower);

  if (isNonScalable || baseServings === targetServings) {
    const simplified = simplifyRational({
      numerator: ing.amountNumerator,
      denominator: ing.amountDenominator,
    });
    return {
      ...ing,
      scaledNumerator: simplified.numerator,
      scaledDenominator: simplified.denominator,
      displayQuantity: isNonScalable && (ing.amountNumerator === 0 || unitLower === 'to taste')
        ? ing.unit
        : formatNaturalFraction(simplified),
      isScaled: false,
    };
  }

  // Exact rational multiplication: (baseNum / baseDen) * (targetServings / baseServings)
  const baseFraction: Rational = {
    numerator: ing.amountNumerator,
    denominator: ing.amountDenominator,
  };
  const multiplierFraction: Rational = {
    numerator: targetServings,
    denominator: baseServings,
  };

  const scaled = multiplyRational(baseFraction, multiplierFraction);

  return {
    ...ing,
    scaledNumerator: scaled.numerator,
    scaledDenominator: scaled.denominator,
    displayQuantity: formatNaturalFraction(scaled),
    isScaled: true,
  };
}

export function scaleRecipeIngredients(
  ingredients: ScalableIngredient[],
  baseServings: number,
  targetServings: number,
): ScaledIngredientResult[] {
  return ingredients.map((ing) => scaleIngredient(ing, baseServings, targetServings));
}
