import { IsString, IsNotEmpty, IsInt, Min, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeDifficulty, UnitDimension } from '@prisma/client';

export class RecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  rawLine: string;

  @IsInt()
  @Min(0)
  amountNumerator: number;

  @IsInt()
  @Min(1)
  amountDenominator: number;

  @IsString()
  unit: string;

  @IsEnum(UnitDimension)
  unitDimension: UnitDimension;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isScalable?: boolean;
}

export class CookingStepDto {
  @IsInt()
  @Min(1)
  stepNumber: number;

  @IsString()
  @IsNotEmpty()
  instruction: string;

  @IsOptional()
  @IsInt()
  timerMinutes?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  coverImageUrl: string;

  @IsInt()
  @Min(1)
  prepTimeMinutes: number;

  @IsInt()
  @Min(0)
  cookTimeMinutes: number;

  @IsInt()
  @Min(1)
  servings: number;

  @IsEnum(RecipeDifficulty)
  difficulty: RecipeDifficulty;

  @IsOptional()
  @IsString()
  cuisineName?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryTags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CookingStepDto)
  steps: CookingStepDto[];
}
