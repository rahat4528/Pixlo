import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@pixlo.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Alex Thorne' })
  @IsString()
  @IsNotEmpty()
  displayName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@pixlo.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'device-uuid-1', required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ example: 'MacBook Pro', required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ example: 'macOS', required: false })
  @IsOptional()
  @IsString()
  platform?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Alex Thorne', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
