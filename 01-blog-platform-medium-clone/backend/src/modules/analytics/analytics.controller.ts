import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RecordViewDto } from './analytics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('articles/:id/view')
  async recordView(@Param('id') articleId: string, @Body() dto: RecordViewDto) {
    const data = await this.analyticsService.recordView(articleId, dto);
    return { success: true, data };
  }

  @Get('author/dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@CurrentUser() user: UserPayload) {
    const data = await this.analyticsService.getAuthorDashboard(user.userId);
    return { success: true, data };
  }
}
