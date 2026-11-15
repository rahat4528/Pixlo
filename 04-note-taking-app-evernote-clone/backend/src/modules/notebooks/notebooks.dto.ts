import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotebookDto {
  @ApiProperty({ example: 'Engineering Design' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#2563eb', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ example: 'stack-uuid-1', required: false })
  @IsOptional()
  @IsString()
  stackId?: string;
}

export class UpdateNotebookDto {
  @ApiProperty({ example: 'Engineering Architecture', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '#10b981', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ example: 'stack-uuid-1', required: false })
  @IsOptional()
  @IsString()
  stackId?: string;
}

export class CreateStackDto {
  @ApiProperty({ example: 'Work Projects' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
