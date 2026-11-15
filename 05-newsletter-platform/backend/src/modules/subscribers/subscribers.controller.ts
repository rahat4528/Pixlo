import { Controller, Get, Post, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriberStatus } from '@prisma/client';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private subscribersService: SubscribersService) {}

  @ApiOperation({ summary: 'Public subscription initiation with double opt-in' })
  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeDto, @Req() req: any) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.subscribersService.subscribe(dto, clientIp);
  }

  @ApiOperation({ summary: 'Public email verification link handler' })
  @Get('confirm')
  async confirm(@Query('token') token: string) {
    return this.subscribersService.confirm(token);
  }

  @ApiOperation({ summary: 'One-click list unsubscribe destination (RFC 8058)' })
  @Get('unsubscribe')
  async unsubscribeGet(@Query('token') token: string) {
    return this.subscribersService.unsubscribe(token);
  }

  @ApiOperation({ summary: 'POST one-click list unsubscribe handler' })
  @Post('unsubscribe')
  async unsubscribePost(@Body('token') token: string, @Body('reason') reason?: string) {
    return this.subscribersService.unsubscribe(token, reason);
  }

  @ApiOperation({ summary: 'List subscribers for publication with search and pagination' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'publicationId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: SubscriberStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async findByPublication(
    @Query('publicationId') publicationId: string,
    @Query('status') status?: SubscriberStatus,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.subscribersService.findByPublication(
      publicationId,
      status,
      search,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20
    );
  }

  @ApiOperation({ summary: 'Bulk import subscribers from CSV / payload' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bulk-import')
  async bulkImport(@Body() dto: BulkImportDto) {
    return this.subscribersService.bulkImport(dto);
  }
}
