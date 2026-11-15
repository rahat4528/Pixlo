import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'pub-uuid-123' })
  @IsString()
  @IsNotEmpty()
  publicationId: string;

  @ApiPropertyOptional({ example: 'tmpl-uuid-123' })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({ example: 'Issue #42: Transactional Outbox Pattern' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Issue #42: Eliminating Dual-Write Failures' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ example: 'How modern engineering teams guarantee eventual consistency' })
  @IsString()
  @IsOptional()
  previewText?: string;

  @ApiProperty({ example: '<h2>Outbox Pattern</h2><p>Content...</p>' })
  @IsString()
  @IsNotEmpty()
  htmlBody: string;

  @ApiPropertyOptional({ example: 'Plain text content...' })
  @IsString()
  @IsOptional()
  plainTextBody?: string;

  @ApiPropertyOptional({ example: '2026-03-01T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;
}
