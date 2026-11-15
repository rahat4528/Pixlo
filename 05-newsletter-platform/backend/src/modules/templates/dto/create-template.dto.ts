import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'pub-uuid-123' })
  @IsString()
  @IsNotEmpty()
  publicationId: string;

  @ApiProperty({ example: 'Standard Editorial Issue' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Issue #{{issue_number}}' })
  @IsString()
  @IsOptional()
  subjectDefault?: string;

  @ApiProperty({ example: '<div>{{content}}</div>' })
  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @ApiPropertyOptional({ example: '{{content}}' })
  @IsString()
  @IsOptional()
  plainTextContent?: string;

  @ApiPropertyOptional({ example: 'Preview text excerpt' })
  @IsString()
  @IsOptional()
  previewText?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
