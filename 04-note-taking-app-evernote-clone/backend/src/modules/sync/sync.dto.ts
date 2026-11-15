import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SyncOpType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class SyncOpDto {
  @ApiProperty({ example: 'op-uuid-1234' })
  @IsString()
  @IsNotEmpty()
  clientOpId: string;

  @ApiProperty({ example: 'note-uuid-1' })
  @IsString()
  @IsNotEmpty()
  noteId: string;

  @ApiProperty({ enum: SyncOpType })
  @IsEnum(SyncOpType)
  operation: SyncOpType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  baseRevision: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notebookId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class SyncPushDto {
  @ApiProperty({ example: 'device-uuid-1' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ type: [SyncOpDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOpDto)
  operations: SyncOpDto[];
}
