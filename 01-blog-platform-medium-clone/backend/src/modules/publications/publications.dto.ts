import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PublicationRole, ReviewVerdict } from '@prisma/client';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  requireReview?: boolean;
}

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(PublicationRole)
  role: PublicationRole;
}

export class EditorialVerdictDto {
  @IsEnum(ReviewVerdict)
  verdict: ReviewVerdict;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
