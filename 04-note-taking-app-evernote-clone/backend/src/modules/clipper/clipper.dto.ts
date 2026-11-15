import { IsNotEmpty, IsUrl, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClipUrlDto {
  @ApiProperty({ example: 'https://example.com/blog/microkernels' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'Article Title Override', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'notebook-uuid-1', required: false })
  @IsOptional()
  @IsString()
  notebookId?: string;
}
