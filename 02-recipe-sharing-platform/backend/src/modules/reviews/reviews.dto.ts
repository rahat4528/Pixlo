import { IsInt, Min, Max, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SubmitRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

export class SubmitReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
