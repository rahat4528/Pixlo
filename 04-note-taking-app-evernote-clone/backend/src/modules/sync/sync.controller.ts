import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncPushDto } from './sync.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('sync')
@Controller('api/sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Submit batched offline operations with 3-way merge conflict detection' })
  async pushSync(@CurrentUser() user: any, @Body() dto: SyncPushDto) {
    return this.syncService.processSyncPush(user.sub, dto);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull server changes modified since timestamp' })
  @ApiQuery({ name: 'since', required: false, type: String })
  async pullSync(@CurrentUser() user: any, @Query('since') since?: string) {
    return this.syncService.pullChanges(user.sub, since);
  }
}
