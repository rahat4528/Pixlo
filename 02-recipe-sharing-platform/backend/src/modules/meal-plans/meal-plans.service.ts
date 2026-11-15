import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SaveMealPlanDto } from './meal-plans.dto';
import { mergeShoppingListItems, RawShoppingItem } from '../../common/shopping-list-merger.util';

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMealPlan(userId: string, dto: SaveMealPlanDto) {
    const weekStart = new Date(dto.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);

    // Delete existing entries for this week if any, then recreate
    let plan = await this.prisma.mealPlan.findFirst({
      where: { userId, weekStartDate: weekStart },
    });

    if (plan) {
      await this.prisma.mealPlanEntry.deleteMany({
        where: { mealPlanId: plan.id },
      });
    } else {
      plan = await this.prisma.mealPlan.create({
        data: {
          userId,
          weekStartDate: weekStart,
        },
      });
    }

    if (dto.entries.length > 0) {
      await this.prisma.mealPlanEntry.createMany({
        data: dto.entries.map((e) => ({
          mealPlanId: plan.id,
          recipeId: e.recipeId,
          dayOfWeek: e.dayOfWeek,
          mealType: e.mealType,
        })),
      });
    }

    return this.prisma.mealPlan.findUnique({
      where: { id: plan.id },
      include: {
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                totalTimeMinutes: true,
                servings: true,
              },
            },
          },
        },
      },
    });
  }

  async getMealPlan(userId: string, weekStartDate?: string) {
    const targetDate = weekStartDate ? new Date(weekStartDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.mealPlan.findFirst({
      where: { userId },
      include: {
        entries: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                totalTimeMinutes: true,
                servings: true,
              },
            },
          },
        },
      },
      orderBy: { weekStartDate: 'desc' },
    });
  }

  async generateShoppingListFromMealPlan(userId: string, mealPlanId: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        entries: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plan || plan.userId !== userId) {
      throw new NotFoundException('Meal plan not found');
    }

    // Collect all raw ingredients
    const rawItems: RawShoppingItem[] = [];
    for (const entry of plan.entries) {
      for (const ri of entry.recipe.ingredients) {
        rawItems.push({
          ingredientName: ri.ingredient.canonicalName,
          amountNumerator: ri.amountNumerator,
          amountDenominator: ri.amountDenominator,
          unit: ri.unit,
          unitDimension: ri.unitDimension,
          notes: ri.notes,
        });
      }
    }

    // Run dimension-safe consolidation
    const merged = mergeShoppingListItems(rawItems);

    // Save as persistent shopping list
    const shoppingList = await this.prisma.shoppingList.create({
      data: {
        userId,
        title: `Grocery List for Week of ${plan.weekStartDate.toLocaleDateString()}`,
        items: {
          create: merged.map((m) => ({
            ingredientName: m.ingredientName,
            amountNumerator: m.amountNumerator,
            amountDenominator: m.amountDenominator,
            unit: m.unit,
            unitDimension: m.unitDimension,
            isCompleted: false,
            notes: m.displayQuantity ? `Total: ${m.displayQuantity} ${m.unit}` : null,
          })),
        },
      },
      include: { items: true },
    });

    return shoppingList;
  }
}
