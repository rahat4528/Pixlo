import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportSubscriberItemDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Alex' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rivera' })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class BulkImportDto {
  @ApiProperty({ example: 'pub-uuid-123' })
  @IsString()
  @IsNotEmpty()
  publicationId: string;

  @ApiPropertyOptional({ example: 'list-uuid-123' })
  @IsString()
  @IsOptional()
  listId?: string;

  @ApiProperty({ type: [ImportSubscriberItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportSubscriberItemDto)
  subscribers: ImportSubscriberItemDto[];
}
