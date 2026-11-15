import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateRecipeDto } from './recipes.dto';
import { scaleRecipeIngredients, ScalableIngredient } from '../../common/scaling.util';
import { rankRecipesByIngredients } from '../../common/ingredient-search.util';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  }

  async createRecipe(creatorId: string, dto: CreateRecipeDto) {
    const slug = this.slugify(dto.title);
    const totalTimeMinutes = dto.prepTimeMinutes + dto.cookTimeMinutes;

    let cuisineId: string | null = null;
    if (dto.cuisineName) {
      const cuisineSlug = dto.cuisineName.toLowerCase().replace(/\s+/g, '-');
      const cuisine = await this.prisma.cuisine.upsert({
        where: { slug: cuisineSlug },
        create: { name: dto.cuisineName, slug: cuisineSlug },
        update: {},
      });
      cuisineId = cuisine.id;
    }

    let categoryId: string | null = null;
    if (dto.categoryName) {
      const catSlug = dto.categoryName.toLowerCase().replace(/\s+/g, '-');
      const category = await this.prisma.recipeCategory.upsert({
        where: { slug: catSlug },
        create: { name: dto.categoryName, slug: catSlug },
        update: {},
      });
      categoryId = category.id;
    }

    const recipe = await this.prisma.recipe.create({
      data: {
        creatorId,
        title: dto.title,
        slug,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        prepTimeMinutes: dto.prepTimeMinutes,
        cookTimeMinutes: dto.cookTimeMinutes,
        totalTimeMinutes,
        servings: dto.servings,
        difficulty: dto.difficulty,
        cuisineId,
        categoryId,
        steps: {
          create: dto.steps.map((s) => ({
            stepNumber: s.stepNumber,
            instruction: s.instruction,
            timerMinutes: s.timerMinutes || null,
            imageUrl: s.imageUrl || null,
          })),
        },
      },
      include: {
        creator: { select: { id: true, profile: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    // Create / Connect normalized ingredients
    for (let i = 0; i < dto.ingredients.length; i++) {
      const ingDto = dto.ingredients[i];
      const ingredient = await this.prisma.ingredient.upsert({
        where: { canonicalName: ingDto.name.trim() },
        create: { canonicalName: ingDto.name.trim() },
        update: {},
      });

      await this.prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          rawLine: ingDto.rawLine,
          amountNumerator: ingDto.amountNumerator,
          amountDenominator: ingDto.amountDenominator,
          unit: ingDto.unit,
          unitDimension: ingDto.unitDimension,
          notes: ingDto.notes || null,
          isScalable: ingDto.isScalable ?? true,
          orderIndex: i,
        },
      });
    }

    // Connect dietary tags
    if (dto.dietaryTags && dto.dietaryTags.length > 0) {
      for (const tag of dto.dietaryTags) {
        const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
        const dietaryTag = await this.prisma.dietaryTag.upsert({
          where: { slug: tagSlug },
          create: { name: tag, slug: tagSlug },
          update: {},
        });
        await this.prisma.recipeTag.create({
          data: { recipeId: recipe.id, tagId: dietaryTag.id },
        });
      }
    }

    return this.getRecipeBySlug(recipe.slug);
  }

  async getRecipeBySlug(slug: string, targetServings?: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, profile: true } },
        cuisine: true,
        category: true,
        dietaryTags: { include: { tag: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        ingredients: {
          include: { ingredient: true },
          orderBy: { orderIndex: 'asc' },
        },
        reviews: {
          include: { user: { select: { id: true, profile: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe ${slug} not found`);
    }

    const requestedServings = targetServings && targetServings > 0 ? targetServings : recipe.servings;

    const rawIngredients: ScalableIngredient[] = recipe.ingredients.map((ri) => ({
      id: ri.id,
      name: ri.ingredient.canonicalName,
      amountNumerator: ri.amountNumerator,
      amountDenominator: ri.amountDenominator,
      unit: ri.unit,
      unitDimension: ri.unitDimension,
      notes: ri.notes,
      isScalable: ri.isScalable,
    }));

    const scaledIngredients = scaleRecipeIngredients(
      rawIngredients,
      recipe.servings,
      requestedServings,
    );

    // Schema.org Recipe structured data
    const schemaOrgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.title,
      description: recipe.description,
      image: [recipe.coverImageUrl],
      author: {
        '@type': 'Person',
        name: recipe.creator.profile?.displayName || 'Pixlo Chef',
      },
      prepTime: `PT${recipe.prepTimeMinutes}M`,
      cookTime: `PT${recipe.cookTimeMinutes}M`,
      totalTime: `PT${recipe.totalTimeMinutes}M`,
      recipeYield: `${requestedServings} servings`,
      recipeCategory: recipe.category?.name || 'Main Course',
      recipeCuisine: recipe.cuisine?.name || 'International',
      recipeIngredient: scaledIngredients.map((i) =>
        i.displayQuantity ? `${i.displayQuantity} ${i.unit} ${i.name}`.trim() : `${i.unit} ${i.name}`.trim()
      ),
      recipeInstructions: recipe.steps.map((s) => ({
        '@type': 'HowToStep',
        text: s.instruction,
        position: s.stepNumber,
      })),
      aggregateRating: recipe.ratingsCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: recipe.averageRating,
        ratingCount: recipe.ratingsCount,
      } : undefined,
    };

    return {
      ...recipe,
      activeServings: requestedServings,
      baseServings: recipe.servings,
      scaledIngredients,
      schemaOrgJsonLd,
    };
  }

  async searchByIngredients(availableIngredientsString: string) {
    if (!availableIngredientsString) return [];
    const available = availableIngredientsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const candidates = await this.prisma.recipe.findMany({
      where: { isPublished: true },
      include: {
        cuisine: true,
        category: true,
        ingredients: { include: { ingredient: true } },
      },
      take: 50,
    });

    const mapped = candidates.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      coverImageUrl: r.coverImageUrl,
      servings: r.servings,
      prepTimeMinutes: r.prepTimeMinutes,
      cookTimeMinutes: r.cookTimeMinutes,
      totalTimeMinutes: r.totalTimeMinutes,
      difficulty: r.difficulty,
      cuisine: r.cuisine,
      category: r.category,
      ingredients: r.ingredients.map((ri) => ({
        canonicalName: ri.ingredient.canonicalName,
      })),
    }));

    return rankRecipesByIngredients(mapped, available);
  }

  async getDiscovery(params: {
    page?: number;
    limit?: number;
    cuisine?: string;
    category?: string;
    dietaryTag?: string;
    difficulty?: string;
    maxTotalTime?: number;
    sort?: 'popular' | 'rating' | 'newest';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };

    if (params.cuisine) {
      where.cuisine = { slug: params.cuisine.toLowerCase() };
    }
    if (params.category) {
      where.category = { slug: params.category.toLowerCase() };
    }
    if (params.dietaryTag) {
      where.dietaryTags = { some: { tag: { slug: params.dietaryTag.toLowerCase() } } };
    }
    if (params.difficulty) {
      where.difficulty = params.difficulty.toUpperCase();
    }
    if (params.maxTotalTime) {
      where.totalTimeMinutes = { lte: params.maxTotalTime };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sort === 'popular') {
      orderBy = { viewCount: 'desc' };
    } else if (params.sort === 'rating') {
      orderBy = { averageRating: 'desc' };
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          creator: { select: { id: true, profile: true } },
          cuisine: true,
          category: true,
          dietaryTags: { include: { tag: true } },
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      items: recipes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaxonomies() {
    const [cuisines, categories, dietaryTags] = await Promise.all([
      this.prisma.cuisine.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.recipeCategory.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.dietaryTag.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return { cuisines, categories, dietaryTags };
  }
}
