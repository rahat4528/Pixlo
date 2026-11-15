import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { QueryJobsDto } from './ingestion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('ingestion')
@Controller('api/ingestion')
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Get('jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List automated and manual feed ingestion job logs (Admin only)' })
  async listJobs(@Query() query: QueryJobsDto) {
    return this.ingestionService.listJobs(query);
  }

  @Get('errors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ingestion errors and failure tracking (Admin only)' })
  @ApiQuery({ name: 'resolved', required: false, type: Boolean })
  async listErrors(@Query('resolved') resolved?: string) {
    const isResolved = resolved === 'true';
    return this.ingestionService.listErrors(isResolved);
  }

  @Post('feeds/:feedSourceId/trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger immediate feed ingestion with SSRF & duplicate checks (Admin only)' })
  async triggerFeedIngestion(@Param('feedSourceId') feedSourceId: string) {
    return this.ingestionService.ingestFeed(feedSourceId);
  }

  @Post('errors/:errorId/retry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry a failed ingestion job using exponential backoff tracking (Admin only)' })
  async retryFailed(@Param('errorId') errorId: string) {
    return this.ingestionService.retryError(errorId);
  }

  @Post('sources/:sourceId/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resume an automatically suspended publisher source (Admin only)' })
  async resumeSource(@Param('sourceId') sourceId: string) {
    return this.ingestionService.resumeSource(sourceId);
  }
}
