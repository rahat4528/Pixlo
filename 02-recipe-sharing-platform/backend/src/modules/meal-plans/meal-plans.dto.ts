import { IsString, IsNotEmpty, IsInt, Min, Max, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '@prisma/client';

export class MealPlanEntryDto {
  @IsString()
  @IsNotEmpty()
  recipeId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday

  @IsEnum(MealType)
  mealType: MealType;
}

export class SaveMealPlanDto {
  @IsDateString()
  weekStartDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanEntryDto)
  entries: MealPlanEntryDto[];
}
