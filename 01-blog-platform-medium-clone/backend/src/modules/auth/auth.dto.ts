import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  displayName: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,30}$/, {
    message: 'Username must be between 3 and 30 alphanumeric characters, hyphens, or underscores',
  })
  username: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
