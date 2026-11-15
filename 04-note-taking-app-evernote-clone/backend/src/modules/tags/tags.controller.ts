import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './tags.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tags')
@Controller('api/tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List user tags with note counts' })
  async listTags(@CurrentUser() user: any) {
    return this.tagsService.listTags(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  async createTag(@CurrentUser() user: any, @Body() dto: CreateTagDto) {
    return this.tagsService.createTag(user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  async deleteTag(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tagsService.deleteTag(user.sub, id);
  }
}
