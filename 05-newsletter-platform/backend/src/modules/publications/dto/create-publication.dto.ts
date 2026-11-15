import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicationDto {
  @ApiProperty({ example: 'The Weekly Disruption' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'weekly-disruption' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Deep dives on distributed systems architecture.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://disruption.pixlo.local' })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiProperty({ example: 'Sarah Publisher' })
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiProperty({ example: 'sarah@disruption.pixlo.local' })
  @IsEmail()
  senderEmail: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  doubleOptIn?: boolean;
}
