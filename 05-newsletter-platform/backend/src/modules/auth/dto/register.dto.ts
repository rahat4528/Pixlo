import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'creator@pixlonewsletter.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Sarah Publisher' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
