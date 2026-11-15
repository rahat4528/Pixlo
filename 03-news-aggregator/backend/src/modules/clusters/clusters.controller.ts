import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClustersService } from './clusters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('clusters')
@Controller('api/clusters')
export class ClustersController {
  constructor(private clustersService: ClustersService) {}

  @Get()
  @ApiOperation({ summary: 'List story clusters grouping related coverage across publishers' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isBreaking', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listClusters(
    @Query('category') category?: string,
    @Query('isBreaking') isBreaking?: string,
    @Query('limit') limit?: number,
  ) {
    const breakingBool = isBreaking === undefined ? undefined : isBreaking === 'true';
    return this.clustersService.listClusters(category, breakingBool, limit ? Number(limit) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full cluster details and all coverage articles' })
  async getCluster(@Param('id') id: string) {
    return this.clustersService.getClusterById(id);
  }

  @Post('recluster')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger an immediate story clustering pass (Admin only)' })
  async triggerClustering() {
    return this.clustersService.runClusteringPass();
  }
}
