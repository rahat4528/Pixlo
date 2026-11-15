import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto, QueryNotesDto, CreateReminderDto } from './notes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('notes')
@Controller('api/notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter notes with full text search' })
  async listNotes(@CurrentUser() user: any, @Query() query: QueryNotesDto) {
    return this.notesService.listNotes(user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note with revision 1' })
  async createNote(@CurrentUser() user: any, @Body() dto: CreateNoteDto) {
    return this.notesService.createNote(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note detail, attachments, tags, and revisions' })
  async getNote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.getNoteById(user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update note with optimistic concurrency check' })
  async updateNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(user.sub, id, dto);
  }

  @Post(':id/trash')
  @ApiOperation({ summary: 'Move note to trash' })
  async moveToTrash(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.moveToTrash(user.sub, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore note from trash' })
  async restoreFromTrash(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.restoreFromTrash(user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete a note' })
  async permanentDelete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notesService.permanentDelete(user.sub, id);
  }

  @Post(':id/revisions/:revision/restore')
  @ApiOperation({ summary: 'Restore a previous note revision' })
  async restoreRevision(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('revision') revision: number,
  ) {
    return this.notesService.restoreRevision(user.sub, id, Number(revision));
  }

  @Post(':id/reminders')
  @ApiOperation({ summary: 'Add a scheduled reminder to a note' })
  async addReminder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.notesService.createReminder(user.sub, id, dto);
  }

  @Get(':id/export/markdown')
  @ApiOperation({ summary: 'Export note as clean Markdown file' })
  async exportMarkdown(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const md = await this.notesService.exportMarkdown(user.sub, id);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="note-${id}.md"`);
    res.send(md);
  }
}
