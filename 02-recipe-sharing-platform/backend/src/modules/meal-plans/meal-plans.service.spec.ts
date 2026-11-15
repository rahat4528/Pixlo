import { MealPlansService } from './meal-plans.service';
import { UnitDimension } from '@prisma/client';

describe('MealPlansService (Meal Plan to Shopping List Consolidation)', () => {
  let service: MealPlansService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      mealPlan: {
        findUnique: jest.fn(),
      },
      shoppingList: {
        create: jest.fn(),
      },
    };
    service = new MealPlansService(mockPrisma);
  });

  it('aggregates ingredients across multiple recipes in a weekly meal plan safely', async () => {
    mockPrisma.mealPlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      userId: 'user-leo',
      weekStartDate: new Date('2026-11-16'),
      entries: [
        {
          recipe: {
            title: 'Dinner Carbonara',
            ingredients: [
              {
                ingredient: { canonicalName: 'Guanciale' },
                amountNumerator: 200,
                amountDenominator: 1,
                unit: 'g',
                unitDimension: UnitDimension.MASS,
                notes: null,
              },
            ],
          },
        },
        {
          recipe: {
            title: 'Lunch Carbonara',
            ingredients: [
              {
                ingredient: { canonicalName: 'Guanciale' },
                amountNumerator: 150,
                amountDenominator: 1,
                unit: 'g',
                unitDimension: UnitDimension.MASS,
                notes: null,
              },
            ],
          },
        },
      ],
    });

    mockPrisma.shoppingList.create.mockImplementation((args: any) => Promise.resolve(args.data));

    const result = await service.generateShoppingListFromMealPlan('user-leo', 'plan-1');

    expect(mockPrisma.shoppingList.create).toHaveBeenCalled();
    const createdItems = mockPrisma.shoppingList.create.mock.calls[0][0].data.items.create;
    expect(createdItems.length).toBe(1);
    expect(createdItems[0].ingredientName).toBe('Guanciale');
    expect(createdItems[0].amountNumerator).toBe(350); // 200 + 150 = 350g
    expect(createdItems[0].unit).toBe('g');
  });
});
