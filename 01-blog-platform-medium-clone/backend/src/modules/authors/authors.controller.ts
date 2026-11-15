import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { UpdateProfileDto } from './authors.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  async getProfile(@Param('username') username: string, @CurrentUser() user?: UserPayload) {
    const data = await this.authorsService.getProfileByUsername(username, user?.userId);
    return { success: true, data };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: UserPayload, @Body() dto: UpdateProfileDto) {
    const data = await this.authorsService.updateProfile(user.userId, dto);
    return { success: true, data, message: 'Profile updated' };
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  async followAuthor(@CurrentUser() user: UserPayload, @Param('username') username: string) {
    const data = await this.authorsService.followAuthor(user.userId, username);
    return { success: true, data, message: `Followed @${username}` };
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowAuthor(@CurrentUser() user: UserPayload, @Param('username') username: string) {
    const data = await this.authorsService.unfollowAuthor(user.userId, username);
    return { success: true, data, message: `Unfollowed @${username}` };
  }
}
