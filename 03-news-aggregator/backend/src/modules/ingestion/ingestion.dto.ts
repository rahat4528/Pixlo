import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';

export class QueryJobsDto {
  @ApiProperty({ required: false, enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  feedSourceId?: string;
}
