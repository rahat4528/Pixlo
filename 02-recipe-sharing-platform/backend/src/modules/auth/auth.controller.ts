import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterCookDto, LoginCookDto, RefreshTokenDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterCookDto) {
    const data = await this.authService.register(dto);
    return { success: true, data, message: 'Cook profile registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginCookDto) {
    const data = await this.authService.login(dto);
    return { success: true, data, message: 'Successfully authenticated' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return { success: true, data, message: 'Tokens refreshed' };
  }
}
