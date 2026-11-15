import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { SendTestEmailDto } from './dto/send-test.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignStatus } from '@prisma/client';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @ApiOperation({ summary: 'Create a draft or scheduled campaign' })
  @Post()
  async create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing draft or scheduled campaign' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCampaignDto>) {
    return this.campaignsService.update(id, dto);
  }

  @ApiOperation({ summary: 'List campaigns for a publication' })
  @ApiQuery({ name: 'publicationId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @Get()
  async findByPublication(
    @Query('publicationId') publicationId: string,
    @Query('status') status?: CampaignStatus
  ) {
    return this.campaignsService.findByPublication(publicationId, status);
  }

  @ApiOperation({ summary: 'Get campaign details by id' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @ApiOperation({ summary: 'Send preview test email to an author address' })
  @Post(':id/send-test')
  async sendTest(@Param('id') id: string, @Body() dto: SendTestEmailDto) {
    return this.campaignsService.sendTest(id, dto);
  }

  @ApiOperation({ summary: 'Dispatch campaign to eligible confirmed subscribers' })
  @Post(':id/dispatch')
  async dispatch(@Param('id') id: string) {
    return this.campaignsService.dispatch(id);
  }

  @ApiOperation({ summary: 'Cancel scheduled campaign' })
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.campaignsService.cancel(id);
  }
}
