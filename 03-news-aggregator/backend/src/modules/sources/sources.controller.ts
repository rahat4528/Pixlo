import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceStatusDto } from './sources.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, SourceStatus } from '@prisma/client';

@ApiTags('sources')
@Controller('api/sources')
export class SourcesController {
  constructor(private sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered publisher sources' })
  @ApiQuery({ name: 'status', enum: SourceStatus, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  async listSources(
    @Query('status') status?: SourceStatus,
    @Query('category') category?: string,
  ) {
    return this.sourcesService.listSources(status, category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List standard taxonomy categories' })
  async getCategories() {
    return this.sourcesService.getCategories();
  }

  @Get('topics')
  @ApiOperation({ summary: 'List trending topic tags' })
  async getTopics() {
    return this.sourcesService.getTopics();
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve publisher profile, feeds, and recent stories' })
  async getSource(@Param('slug') slug: string, @CurrentUser() user?: any) {
    return this.sourcesService.getSourceBySlug(slug, user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new publisher news source (Admin only)' })
  async createSource(@Body() dto: CreateSourceDto) {
    return this.sourcesService.createSource(dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update source status (Active, Paused, Suspended) (Admin only)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateSourceStatusDto) {
    return this.sourcesService.updateSourceStatus(id, dto);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle following a publisher' })
  async toggleFollow(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sourcesService.toggleFollowSource(user.sub, id);
  }
}
