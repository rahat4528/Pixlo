import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @ApiOperation({ summary: 'Create an email template' })
  @Post()
  async create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @ApiOperation({ summary: 'List email templates for publication' })
  @ApiQuery({ name: 'publicationId', required: true })
  @Get()
  async findByPublication(@Query('publicationId') publicationId: string) {
    return this.templatesService.findByPublication(publicationId);
  }

  @ApiOperation({ summary: 'Get template by id' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @ApiOperation({ summary: 'Delete email template' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }
}
