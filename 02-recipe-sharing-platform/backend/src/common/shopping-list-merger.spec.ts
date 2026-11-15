import { mergeShoppingListItems, RawShoppingItem } from './shopping-list-merger.util';
import { UnitDimension } from '@prisma/client';

describe('Dimension-Safe Shopping List Consolidation', () => {
  it('merges identical ingredients within the same unit dimension and unit', () => {
    const items: RawShoppingItem[] = [
      {
        ingredientName: 'Guanciale',
        amountNumerator: 200,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
      {
        ingredientName: 'Guanciale',
        amountNumerator: 300,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
    ];

    const merged = mergeShoppingListItems(items);
    expect(merged.length).toBe(1);
    expect(merged[0].ingredientName).toBe('Guanciale');
    expect(merged[0].amountNumerator).toBe(500);
    expect(merged[0].amountDenominator).toBe(1);
    expect(merged[0].displayQuantity).toBe('500');
  });

  it('adds fractional amounts with exact precision (e.g. 1/2 tsp + 1/4 tsp = 3/4 tsp)', () => {
    const items: RawShoppingItem[] = [
      {
        ingredientName: 'Black Pepper',
        amountNumerator: 1,
        amountDenominator: 2,
        unit: 'tsp',
        unitDimension: UnitDimension.VOLUME,
      },
      {
        ingredientName: 'Black Pepper',
        amountNumerator: 1,
        amountDenominator: 4,
        unit: 'tsp',
        unitDimension: UnitDimension.VOLUME,
      },
    ];

    const merged = mergeShoppingListItems(items);
    expect(merged.length).toBe(1);
    expect(merged[0].displayQuantity).toBe('3/4');
    expect(merged[0].unit).toBe('tsp');
  });

  it('strictly preserves separate lines when unit dimensions conflict (e.g. MASS vs VOLUME)', () => {
    const items: RawShoppingItem[] = [
      {
        ingredientName: 'Flour',
        amountNumerator: 250,
        amountDenominator: 1,
        unit: 'g',
        unitDimension: UnitDimension.MASS,
      },
      {
        ingredientName: 'Flour',
        amountNumerator: 1,
        amountDenominator: 1,
        unit: 'cup',
        unitDimension: UnitDimension.VOLUME,
      },
    ];

    // Must NOT merge mass and volume into a lossy nonsense quantity without density tables!
    const merged = mergeShoppingListItems(items);
    expect(merged.length).toBe(2);
    const massItem = merged.find((m) => m.unitDimension === UnitDimension.MASS);
    const volumeItem = merged.find((m) => m.unitDimension === UnitDimension.VOLUME);

    expect(massItem).toBeDefined();
    expect(massItem?.displayQuantity).toBe('250');
    expect(volumeItem).toBeDefined();
    expect(volumeItem?.displayQuantity).toBe('1');
  });
});
