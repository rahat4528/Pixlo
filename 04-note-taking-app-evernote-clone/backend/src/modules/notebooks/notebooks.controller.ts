import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotebooksService } from './notebooks.service';
import { CreateNotebookDto, UpdateNotebookDto, CreateStackDto } from './notebooks.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notebooks')
@Controller('api/notebooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotebooksController {
  constructor(private notebooksService: NotebooksService) {}

  @Get()
  @ApiOperation({ summary: 'List all notebooks and stacks for user' })
  async listNotebooks(@CurrentUser() user: any) {
    return this.notebooksService.listNotebooks(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notebook' })
  async createNotebook(@CurrentUser() user: any, @Body() dto: CreateNotebookDto) {
    return this.notebooksService.createNotebook(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update or move a notebook' })
  async updateNotebook(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateNotebookDto,
  ) {
    return this.notebooksService.updateNotebook(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notebook (cannot delete default)' })
  async deleteNotebook(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notebooksService.deleteNotebook(user.sub, id);
  }

  @Post('stacks')
  @ApiOperation({ summary: 'Create a new notebook stack' })
  async createStack(@CurrentUser() user: any, @Body() dto: CreateStackDto) {
    return this.notebooksService.createStack(user.sub, dto);
  }
}
