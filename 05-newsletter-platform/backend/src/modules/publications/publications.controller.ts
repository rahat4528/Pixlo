import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Publications')
@Controller('publications')
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @ApiOperation({ summary: 'Create a new publication' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreatePublicationDto) {
    return this.publicationsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'List publications owned by current user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findMine(@Request() req: any) {
    return this.publicationsService.findByUser(req.user.id);
  }

  @ApiOperation({ summary: 'Get public publication profile by slug' })
  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.publicationsService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Get publication by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.publicationsService.findById(id);
  }
}
