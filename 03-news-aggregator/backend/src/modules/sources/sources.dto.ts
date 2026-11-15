import { IsString, IsNotEmpty, IsUrl, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SourceStatus, FeedFormat } from '@prisma/client';

export class CreateSourceDto {
  @ApiProperty({ example: 'Tech Horizon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tech-horizon' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'https://techhorizon.io' })
  @IsUrl()
  websiteUrl: string;

  @ApiProperty({ example: 'https://techhorizon.io/feed.xml' })
  @IsUrl()
  feedUrl: string;

  @ApiProperty({ example: 'technology' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'In-depth coverage of emerging systems', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://techhorizon.io/logo.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ enum: FeedFormat, default: FeedFormat.RSS, required: false })
  @IsOptional()
  @IsEnum(FeedFormat)
  format?: FeedFormat;

  @ApiProperty({ example: 15, default: 15, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  refreshIntervalMinutes?: number;
}

export class UpdateSourceStatusDto {
  @ApiProperty({ enum: SourceStatus })
  @IsEnum(SourceStatus)
  status: SourceStatus;
}
