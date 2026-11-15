import { IsString, IsNotEmpty, IsNumber, Min, Max, IsInt, IsOptional } from 'class-validator';

export class RecordViewDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readCompletionPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}
