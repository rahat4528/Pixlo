import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class AddReactionDto {
  @IsEnum(ReactionType)
  type: ReactionType;

  @IsInt()
  @Min(1)
  @Max(50)
  count: number;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class ModerateCommentDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class RecordReadingHistoryDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  readPercent: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  scrollDepth: number;

  @IsInt()
  @Min(0)
  timeSpentSeconds: number;
}

export class CreateReadingListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  isPrivate?: boolean;
}
