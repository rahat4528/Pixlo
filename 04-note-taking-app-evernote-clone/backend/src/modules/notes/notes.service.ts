import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateNoteDto, UpdateNoteDto, QueryNotesDto, CreateReminderDto } from './notes.dto';
import { MarkdownExporter } from '../../../../sync/markdown-exporter';
import { RevisionReason } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async listNotes(userId: string, query: QueryNotesDto) {
    const where: any = { userId };

    if (query.isTrashed !== undefined) {
      where.isTrashed = query.isTrashed;
    } else {
      where.isTrashed = false;
    }

    if (query.notebookId) {
      where.notebookId = query.notebookId;
    }

    if (query.isStarred !== undefined) {
      where.isStarred = query.isStarred;
    }

    if (query.isPinned !== undefined) {
      where.isPinned = query.isPinned;
    }

    if (query.isArchived !== undefined) {
      where.isArchived = query.isArchived;
    }

    if (query.tagId) {
      where.tags = { some: { tagId: query.tagId } };
    }

    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { plainText: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.note.findMany({
      where,
      include: {
        notebook: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
        _count: { select: { attachments: true, revisions: true } },
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  async getNoteById(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
      include: {
        notebook: true,
        tags: { include: { tag: true } },
        revisions: {
          select: {
            id: true,
            revisionNumber: true,
            title: true,
            reason: true,
            createdAt: true,
          },
          orderBy: { revisionNumber: 'desc' },
        },
        attachments: true,
        reminders: { orderBy: { remindAt: 'asc' } },
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID '${noteId}' not found or access denied`);
    }

    return note;
  }

  async createNote(userId: string, dto: CreateNoteDto) {
    // If notebookId not provided, get or create default inbox notebook
    let targetNotebookId = dto.notebookId;
    if (!targetNotebookId) {
      let defaultNb = await this.prisma.notebook.findFirst({
        where: { userId, isDefault: true },
      });
      if (!defaultNb) {
        defaultNb = await this.prisma.notebook.create({
          data: {
            userId,
            name: 'Daily Inbox',
            isDefault: true,
            color: '#059669',
          },
        });
      }
      targetNotebookId = defaultNb.id;
    }

    const content = dto.content || '';
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    return this.prisma.note.create({
      data: {
        userId,
        notebookId: targetNotebookId,
        title: dto.title.trim(),
        content,
        plainText,
        serverRevision: 1,
        revisions: {
          create: {
            revisionNumber: 1,
            title: dto.title.trim(),
            content,
            plainText,
            reason: RevisionReason.MANUAL_SAVE,
          },
        },
        tags: dto.tagIds && dto.tagIds.length > 0 ? {
          create: dto.tagIds.map((tagId) => ({ tagId })),
        } : undefined,
      },
      include: {
        notebook: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async updateNote(userId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID '${noteId}' not found`);
    }

    // Optimistic Concurrency Check: If client specified baseRevision and server is ahead
    if (dto.baseRevision !== undefined && dto.baseRevision < note.serverRevision) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Stale write rejected: Server revision is ${note.serverRevision}, but client base revision was ${dto.baseRevision}`,
        serverRevision: note.serverRevision,
        currentServerNote: {
          id: note.id,
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
        },
      });
    }

    const nextRevision = note.serverRevision + 1;
    const newTitle = dto.title !== undefined ? dto.title.trim() : note.title;
    const newContent = dto.content !== undefined ? dto.content : note.content;
    const newPlainText = newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Create revision snapshot
    await this.prisma.noteRevision.create({
      data: {
        noteId: note.id,
        revisionNumber: nextRevision,
        title: newTitle,
        content: newContent,
        plainText: newPlainText,
        reason: RevisionReason.MANUAL_SAVE,
      },
    });

    // Update tags if supplied
    if (dto.tagIds !== undefined) {
      await this.prisma.noteTag.deleteMany({ where: { noteId: note.id } });
      if (dto.tagIds.length > 0) {
        await this.prisma.noteTag.createMany({
          data: dto.tagIds.map((tagId) => ({ noteId: note.id, tagId })),
        });
      }
    }

    return this.prisma.note.update({
      where: { id: note.id },
      data: {
        title: newTitle,
        content: newContent,
        plainText: newPlainText,
        notebookId: dto.notebookId || note.notebookId,
        isPinned: dto.isPinned !== undefined ? dto.isPinned : note.isPinned,
        isStarred: dto.isStarred !== undefined ? dto.isStarred : note.isStarred,
        isArchived: dto.isArchived !== undefined ? dto.isArchived : note.isArchived,
        serverRevision: nextRevision,
        clientOpId: dto.clientOpId,
      },
      include: {
        notebook: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async restoreRevision(userId: string, noteId: string, revisionNumber: number) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const revision = await this.prisma.noteRevision.findUnique({
      where: { noteId_revisionNumber: { noteId, revisionNumber } },
    });
    if (!revision) {
      throw new NotFoundException(`Revision #${revisionNumber} not found`);
    }

    const nextRevision = note.serverRevision + 1;

    // Create snapshot for restoration record
    await this.prisma.noteRevision.create({
      data: {
        noteId: note.id,
        revisionNumber: nextRevision,
        title: revision.title,
        content: revision.content,
        plainText: revision.plainText,
        reason: RevisionReason.RESTORED,
      },
    });

    return this.prisma.note.update({
      where: { id: note.id },
      data: {
        title: revision.title,
        content: revision.content,
        plainText: revision.plainText,
        serverRevision: nextRevision,
      },
    });
  }

  async moveToTrash(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        isTrashed: true,
        trashedAt: new Date(),
      },
    });
  }

  async restoreFromTrash(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        isTrashed: false,
        trashedAt: null,
      },
    });
  }

  async permanentDelete(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundException('Note not found');

    await this.prisma.note.delete({ where: { id: noteId } });
    return { success: true };
  }

  async createReminder(userId: string, noteId: string, dto: CreateReminderDto) {
    const note = await this.prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.reminder.create({
      data: {
        userId,
        noteId,
        remindAt: new Date(dto.remindAt),
        recurrence: dto.recurrence || 'NONE',
      },
    });
  }

  async exportMarkdown(userId: string, noteId: string): Promise<string> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
      include: {
        notebook: true,
        tags: { include: { tag: true } },
      },
    });
    if (!note) throw new NotFoundException('Note not found');

    return MarkdownExporter.exportToMarkdown({
      title: note.title,
      content: note.content,
      notebookName: note.notebook.name,
      tags: note.tags.map((t) => t.tag.name),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      serverRevision: note.serverRevision,
    });
  }
}
