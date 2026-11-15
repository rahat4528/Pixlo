import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { SaveMealPlanDto } from './meal-plans.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CookUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async savePlan(
    @CurrentUser() user: CookUserPayload,
    @Body() dto: SaveMealPlanDto,
  ) {
    const data = await this.mealPlansService.saveMealPlan(user.userId, dto);
    return { success: true, data, message: 'Meal plan saved' };
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentPlan(
    @CurrentUser() user: CookUserPayload,
    @Query('weekStartDate') weekStartDate?: string,
  ) {
    const data = await this.mealPlansService.getMealPlan(user.userId, weekStartDate);
    return { success: true, data };
  }

  @Post(':id/generate-shopping-list')
  @UseGuards(JwtAuthGuard)
  async generateShoppingList(
    @Param('id') id: string,
    @CurrentUser() user: CookUserPayload,
  ) {
    const data = await this.mealPlansService.generateShoppingListFromMealPlan(user.userId, id);
    return { success: true, data, message: 'Consolidated shopping list created' };
  }
}
