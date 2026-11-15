import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Sprint Planning Meeting' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '# Meeting Notes\n- Task 1\n- Task 2', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'notebook-uuid-1', required: false })
  @IsOptional()
  @IsString()
  notebookId?: string;

  @ApiProperty({ example: ['tag-id-1', 'tag-id-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class UpdateNoteDto {
  @ApiProperty({ example: 'Updated Title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '# Updated content', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'notebook-uuid-1', required: false })
  @IsOptional()
  @IsString()
  notebookId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({ example: ['tag-id-1'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ example: 1, description: 'Base revision client started from' })
  @IsOptional()
  @IsInt()
  @Min(1)
  baseRevision?: number;

  @ApiProperty({ example: 'client-op-12345', required: false })
  @IsOptional()
  @IsString()
  clientOpId?: string;
}

export class QueryNotesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notebookId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tagId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isTrashed?: boolean;
}

export class CreateReminderDto {
  @ApiProperty({ example: '2026-11-20T10:00:00Z' })
  @IsDateString()
  remindAt: string;

  @ApiProperty({ example: 'NONE', required: false })
  @IsOptional()
  @IsString()
  recurrence?: string;
}
