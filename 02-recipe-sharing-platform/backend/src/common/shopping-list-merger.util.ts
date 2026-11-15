import { Rational, addRational, formatNaturalFraction, simplifyRational } from './rational-arithmetic.util';
import { UnitDimension } from '@prisma/client';

export interface RawShoppingItem {
  ingredientName: string;
  amountNumerator: number;
  amountDenominator: number;
  unit: string;
  unitDimension: UnitDimension;
  notes?: string | null;
}

export interface MergedShoppingItem {
  ingredientName: string;
  amountNumerator: number;
  amountDenominator: number;
  unit: string;
  unitDimension: UnitDimension;
  displayQuantity: string;
  notes?: string | null;
}

export function mergeShoppingListItems(items: RawShoppingItem[]): MergedShoppingItem[] {
  // Group key: `${normalizedName}|${unitDimension}`
  // If same dimension and unit, add exact rationals!
  // If conflicting dimensions, keep separate keys so they are NOT mixed.
  const grouped = new Map<string, MergedShoppingItem>();

  for (const item of items) {
    const cleanName = item.ingredientName.trim().toLowerCase();
    const cleanUnit = (item.unit || '').trim().toLowerCase();
    const key = `${cleanName}|${item.unitDimension}|${cleanUnit}`;

    if (!grouped.has(key)) {
      const initialFraction: Rational = simplifyRational({
        numerator: item.amountNumerator,
        denominator: item.amountDenominator,
      });
      grouped.set(key, {
        ingredientName: item.ingredientName.trim(),
        amountNumerator: initialFraction.numerator,
        amountDenominator: initialFraction.denominator,
        unit: item.unit.trim(),
        unitDimension: item.unitDimension,
        displayQuantity: formatNaturalFraction(initialFraction),
        notes: item.notes,
      });
    } else {
      const existing = grouped.get(key)!;
      const sum = addRational(
        { numerator: existing.amountNumerator, denominator: existing.amountDenominator },
        { numerator: item.amountNumerator, denominator: item.amountDenominator }
      );
      existing.amountNumerator = sum.numerator;
      existing.amountDenominator = sum.denominator;
      existing.displayQuantity = formatNaturalFraction(sum);
    }
  }

  return Array.from(grouped.values());
}
