import { Controller, Get, Param, Query, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// 1x1 transparent PNG buffer
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: '1x1 transparent tracking pixel endpoint for open recording' })
  @Get('pixel/:token')
  async getTrackingPixel(
    @Param('token') rawToken: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const token = rawToken.replace(/\.png$/i, '');
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] as string;

    // Asynchronously log open event without delaying pixel delivery
    this.analyticsService.recordOpen(token, clientIp, userAgent).catch(() => {});

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': TRANSPARENT_PNG.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(TRANSPARENT_PNG);
  }

  @ApiOperation({ summary: 'Click redirect tracking endpoint' })
  @Get('click')
  async trackClick(
    @Query('token') token: string,
    @Query('target') target: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    if (!target) {
      return res.status(400).send('Missing destination target URL');
    }

    const decodedTarget = decodeURIComponent(target);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] as string;

    if (token) {
      this.analyticsService.recordClick(token, decodedTarget, clientIp, userAgent).catch(() => {});
    }

    return res.redirect(302, decodedTarget);
  }

  @ApiOperation({ summary: 'Get campaign engagement overview metrics' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('campaigns/:id/overview')
  async getCampaignOverview(@Param('id') id: string) {
    return this.analyticsService.getCampaignOverview(id);
  }
}
