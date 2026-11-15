import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ClipUrlDto } from './clipper.dto';
import { WebClipperService } from '../../../../sync/web-clipper';
import { RevisionReason } from '@prisma/client';

@Injectable()
export class ClipperService {
  constructor(private prisma: PrismaService) {}

  async clipWebPage(userId: string, dto: ClipUrlDto) {
    // 1. SSRF Guard
    const isSafe = await WebClipperService.validateUrl(dto.url);
    if (!isSafe) {
      throw new BadRequestException('Target URL was rejected by SSRF security policy (private, local, or blocked IP).');
    }

    // 2. Fetch page content with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let rawHtml = '';
    try {
      const res = await fetch(dto.url, {
        headers: { 'User-Agent': 'PixloNoteClipper/1.0 (+https://pixlo.io/clipper)' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new BadRequestException(`Remote server responded with HTTP status ${res.status}`);
      }
      rawHtml = await res.text();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to clip web content: ${err.message}`);
    }

    // 3. Extract title if not provided
    let extractedTitle = dto.title;
    if (!extractedTitle) {
      const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      extractedTitle = titleMatch ? titleMatch[1].trim() : 'Web Clip';
    }

    // 4. Sanitize HTML
    const sanitized = WebClipperService.sanitizeHtml(rawHtml);
    const noteContent = WebClipperService.formatClippedNote(extractedTitle, dto.url, sanitized);
    const plainText = noteContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // 5. Store as note
    let notebookId = dto.notebookId;
    if (!notebookId) {
      const defaultNb = await this.prisma.notebook.findFirst({ where: { userId, isDefault: true } });
      notebookId = defaultNb?.id;
    }

    return this.prisma.note.create({
      data: {
        userId,
        notebookId: notebookId!,
        title: extractedTitle,
        content: noteContent,
        plainText,
        serverRevision: 1,
        revisions: {
          create: {
            revisionNumber: 1,
            title: extractedTitle,
            content: noteContent,
            plainText,
            reason: RevisionReason.MANUAL_SAVE,
          },
        },
      },
      include: { notebook: true },
    });
  }
}
