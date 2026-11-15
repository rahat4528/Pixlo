import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SyncPushDto, SyncOpDto, SyncOpType } from './sync.dto';
import { ConflictResolver } from '../../../../sync/conflict-resolver';
import { RevisionReason, SyncStatus } from '@prisma/client';

export interface SyncOperationResult {
  clientOpId: string;
  noteId: string;
  status: SyncStatus;
  serverRevision: number;
  hasConflict: boolean;
  conflictCopyId?: string;
  updatedNote?: any;
  message?: string;
}

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async processSyncPush(userId: string, dto: SyncPushDto): Promise<SyncOperationResult[]> {
    const results: SyncOperationResult[] = [];

    // Update last sync for device
    await this.prisma.deviceSession.updateMany({
      where: { userId, deviceId: dto.deviceId },
      data: { lastSyncAt: new Date() },
    });

    for (const op of dto.operations) {
      // 1. Check idempotency: If clientOpId has already been applied, return cached status
      const existingRecord = await this.prisma.syncRecord.findUnique({
        where: { userId_clientOpId: { userId, clientOpId: op.clientOpId } },
      });

      if (existingRecord) {
        results.push({
          clientOpId: op.clientOpId,
          noteId: op.noteId,
          status: existingRecord.status,
          serverRevision: existingRecord.appliedRevision,
          hasConflict: existingRecord.status === SyncStatus.CONFLICT,
          message: 'Operation previously applied (idempotent replay)',
        });
        continue;
      }

      // 2. Process based on operation type
      if (op.operation === SyncOpType.CREATE) {
        const res = await this.handleCreateOp(userId, dto.deviceId, op);
        results.push(res);
      } else if (op.operation === SyncOpType.UPDATE) {
        const res = await this.handleUpdateOp(userId, dto.deviceId, op);
        results.push(res);
      } else if (op.operation === SyncOpType.DELETE) {
        const res = await this.handleDeleteOp(userId, dto.deviceId, op);
        results.push(res);
      }
    }

    return results;
  }

  private async handleCreateOp(userId: string, deviceId: string, op: SyncOpDto): Promise<SyncOperationResult> {
    let targetNotebookId = op.notebookId;
    if (!targetNotebookId) {
      const defaultNb = await this.prisma.notebook.findFirst({ where: { userId, isDefault: true } });
      targetNotebookId = defaultNb?.id;
    }

    const content = op.content || '';
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const note = await this.prisma.note.create({
      data: {
        id: op.noteId,
        userId,
        notebookId: targetNotebookId!,
        title: op.title || 'Untitled Note',
        content,
        plainText,
        serverRevision: 1,
        clientOpId: op.clientOpId,
        revisions: {
          create: {
            revisionNumber: 1,
            title: op.title || 'Untitled Note',
            content,
            plainText,
            reason: RevisionReason.MANUAL_SAVE,
          },
        },
      },
      include: { notebook: true },
    });

    await this.prisma.syncRecord.create({
      data: {
        userId,
        deviceId,
        noteId: note.id,
        clientOpId: op.clientOpId,
        operation: 'CREATE',
        baseRevision: 0,
        appliedRevision: 1,
        status: SyncStatus.APPLIED,
      },
    });

    return {
      clientOpId: op.clientOpId,
      noteId: note.id,
      status: SyncStatus.APPLIED,
      serverRevision: 1,
      hasConflict: false,
      updatedNote: note,
    };
  }

  private async handleUpdateOp(userId: string, deviceId: string, op: SyncOpDto): Promise<SyncOperationResult> {
    const serverNote = await this.prisma.note.findFirst({
      where: { id: op.noteId, userId },
    });

    if (!serverNote) {
      return {
        clientOpId: op.clientOpId,
        noteId: op.noteId,
        status: SyncStatus.REJECTED,
        serverRevision: 0,
        hasConflict: false,
        message: 'Note not found on server',
      };
    }

    // A) Fast path: Base revision matches server revision exactly
    if (op.baseRevision === serverNote.serverRevision) {
      const nextRevision = serverNote.serverRevision + 1;
      const newTitle = op.title !== undefined ? op.title : serverNote.title;
      const newContent = op.content !== undefined ? op.content : serverNote.content;
      const newPlainText = newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      await this.prisma.noteRevision.create({
        data: {
          noteId: serverNote.id,
          revisionNumber: nextRevision,
          title: newTitle,
          content: newContent,
          plainText: newPlainText,
          reason: RevisionReason.AUTOSAVE,
        },
      });

      const updated = await this.prisma.note.update({
        where: { id: serverNote.id },
        data: {
          title: newTitle,
          content: newContent,
          plainText: newPlainText,
          notebookId: op.notebookId || serverNote.notebookId,
          serverRevision: nextRevision,
          clientOpId: op.clientOpId,
        },
        include: { notebook: true },
      });

      await this.prisma.syncRecord.create({
        data: {
          userId,
          deviceId,
          noteId: serverNote.id,
          clientOpId: op.clientOpId,
          operation: 'UPDATE',
          baseRevision: op.baseRevision,
          appliedRevision: nextRevision,
          status: SyncStatus.APPLIED,
        },
      });

      return {
        clientOpId: op.clientOpId,
        noteId: serverNote.id,
        status: SyncStatus.APPLIED,
        serverRevision: nextRevision,
        hasConflict: false,
        updatedNote: updated,
      };
    }

    // B) Stale Write -> Conflict Resolution Engine
    // Fetch content of base revision that client edited from
    const baseRevRecord = await this.prisma.noteRevision.findUnique({
      where: { noteId_revisionNumber: { noteId: serverNote.id, revisionNumber: op.baseRevision } },
    });

    const baseContent = baseRevRecord ? baseRevRecord.content : '';
    const localContent = op.content || '';
    const remoteContent = serverNote.content;

    // Run 3-way merge
    const mergeResult = ConflictResolver.threeWayMerge(
      baseContent,
      localContent,
      remoteContent,
      serverNote.title,
    );

    if (!mergeResult.hasConflict) {
      // Clean non-overlapping auto-merge!
      const nextRevision = serverNote.serverRevision + 1;
      const newPlainText = mergeResult.mergedText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      await this.prisma.noteRevision.create({
        data: {
          noteId: serverNote.id,
          revisionNumber: nextRevision,
          title: op.title || serverNote.title,
          content: mergeResult.mergedText,
          plainText: newPlainText,
          reason: RevisionReason.MANUAL_SAVE,
        },
      });

      const updated = await this.prisma.note.update({
        where: { id: serverNote.id },
        data: {
          content: mergeResult.mergedText,
          plainText: newPlainText,
          serverRevision: nextRevision,
          clientOpId: op.clientOpId,
        },
        include: { notebook: true },
      });

      await this.prisma.syncRecord.create({
        data: {
          userId,
          deviceId,
          noteId: serverNote.id,
          clientOpId: op.clientOpId,
          operation: 'UPDATE',
          baseRevision: op.baseRevision,
          appliedRevision: nextRevision,
          status: SyncStatus.APPLIED,
        },
      });

      return {
        clientOpId: op.clientOpId,
        noteId: serverNote.id,
        status: SyncStatus.APPLIED,
        serverRevision: nextRevision,
        hasConflict: false,
        updatedNote: updated,
        message: 'Non-overlapping changes automatically merged cleanly.',
      };
    }

    // C) Overlapping Conflict -> Preserve server version and create conflict copy note
    const conflictTitle = ConflictResolver.generateConflictTitle(op.title || serverNote.title);
    const conflictCopy = await this.prisma.note.create({
      data: {
        userId,
        notebookId: serverNote.notebookId,
        title: conflictTitle,
        content: op.content || '',
        plainText: (op.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        serverRevision: 1,
        revisions: {
          create: {
            revisionNumber: 1,
            title: conflictTitle,
            content: op.content || '',
            plainText: (op.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            reason: RevisionReason.CONFLICT_COPY,
          },
        },
      },
    });

    await this.prisma.syncRecord.create({
      data: {
        userId,
        deviceId,
        noteId: serverNote.id,
        clientOpId: op.clientOpId,
        operation: 'UPDATE',
        baseRevision: op.baseRevision,
        appliedRevision: serverNote.serverRevision,
        status: SyncStatus.CONFLICT,
      },
    });

    return {
      clientOpId: op.clientOpId,
      noteId: serverNote.id,
      status: SyncStatus.CONFLICT,
      serverRevision: serverNote.serverRevision,
      hasConflict: true,
      conflictCopyId: conflictCopy.id,
      updatedNote: serverNote,
      message: `Overlapping edit conflict detected. Server version preserved; client edits branched into '${conflictTitle}'.`,
    };
  }

  private async handleDeleteOp(userId: string, deviceId: string, op: SyncOpDto): Promise<SyncOperationResult> {
    await this.prisma.note.updateMany({
      where: { id: op.noteId, userId },
      data: { isTrashed: true, trashedAt: new Date() },
    });

    await this.prisma.syncRecord.create({
      data: {
        userId,
        deviceId,
        noteId: op.noteId,
        clientOpId: op.clientOpId,
        operation: 'DELETE',
        baseRevision: op.baseRevision,
        appliedRevision: op.baseRevision + 1,
        status: SyncStatus.APPLIED,
      },
    });

    return {
      clientOpId: op.clientOpId,
      noteId: op.noteId,
      status: SyncStatus.APPLIED,
      serverRevision: op.baseRevision + 1,
      hasConflict: false,
    };
  }

  async pullChanges(userId: string, sinceDate?: string) {
    const where: any = { userId };
    if (sinceDate) {
      where.updatedAt = { gte: new Date(sinceDate) };
    }

    const [notes, notebooks, tags] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: { tags: { include: { tag: true } } },
      }),
      this.prisma.notebook.findMany({ where: { userId } }),
      this.prisma.tag.findMany({ where: { userId } }),
    ]);

    return {
      serverTimestamp: new Date().toISOString(),
      notes,
      notebooks,
      tags,
    };
  }
}
