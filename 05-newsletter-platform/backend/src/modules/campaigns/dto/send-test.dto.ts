import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailDto {
  @ApiProperty({ example: 'test.reader@example.com' })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;
}
