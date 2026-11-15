import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Architecture' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#2563eb', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
