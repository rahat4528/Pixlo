import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './recipes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CookUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getDiscovery(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cuisine') cuisine?: string,
    @Query('category') category?: string,
    @Query('dietaryTag') dietaryTag?: string,
    @Query('difficulty') difficulty?: string,
    @Query('maxTotalTime') maxTotalTime?: string,
    @Query('sort') sort?: 'popular' | 'rating' | 'newest',
  ) {
    const data = await this.recipesService.getDiscovery({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      cuisine,
      category,
      dietaryTag,
      difficulty,
      maxTotalTime: maxTotalTime ? parseInt(maxTotalTime, 10) : undefined,
      sort,
    });
    return { success: true, data };
  }

  @Get('search-by-ingredients')
  async searchByIngredients(@Query('ingredients') ingredients: string) {
    const data = await this.recipesService.searchByIngredients(ingredients);
    return { success: true, data };
  }

  @Get('taxonomies')
  async getTaxonomies() {
    const data = await this.recipesService.getTaxonomies();
    return { success: true, data };
  }

  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query('servings') servings?: string,
  ) {
    const targetServings = servings ? parseInt(servings, 10) : undefined;
    const data = await this.recipesService.getRecipeBySlug(slug, targetServings);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: CookUserPayload,
    @Body() dto: CreateRecipeDto,
  ) {
    const data = await this.recipesService.createRecipe(user.userId, dto);
    return { success: true, data, message: 'Recipe published successfully' };
  }
}
