import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'creator@pixlonewsletter.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
