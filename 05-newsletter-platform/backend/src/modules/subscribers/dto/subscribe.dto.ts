import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ example: 'pub-uuid-123' })
  @IsString()
  @IsNotEmpty()
  publicationId: string;

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
