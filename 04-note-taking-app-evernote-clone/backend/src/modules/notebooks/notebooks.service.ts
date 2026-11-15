import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateNotebookDto, UpdateNotebookDto, CreateStackDto } from './notebooks.dto';

@Injectable()
export class NotebooksService {
  constructor(private prisma: PrismaService) {}

  async listNotebooks(userId: string) {
    const [notebooks, stacks] = await Promise.all([
      this.prisma.notebook.findMany({
        where: { userId },
        include: {
          stack: true,
          _count: {
            select: { notes: { where: { isTrashed: false } } },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.notebookStack.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { notebooks, stacks };
  }

  async createNotebook(userId: string, dto: CreateNotebookDto) {
    const existing = await this.prisma.notebook.findUnique({
      where: { userId_name: { userId, name: dto.name.trim() } },
    });
    if (existing) {
      throw new ConflictException(`Notebook '${dto.name}' already exists`);
    }

    return this.prisma.notebook.create({
      data: {
        userId,
        name: dto.name.trim(),
        color: dto.color || '#4f46e5',
        stackId: dto.stackId,
      },
    });
  }

  async updateNotebook(userId: string, id: string, dto: UpdateNotebookDto) {
    const notebook = await this.prisma.notebook.findFirst({
      where: { id, userId },
    });
    if (!notebook) {
      throw new NotFoundException('Notebook not found');
    }

    return this.prisma.notebook.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        color: dto.color,
        stackId: dto.stackId,
      },
    });
  }

  async deleteNotebook(userId: string, id: string) {
    const notebook = await this.prisma.notebook.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { notes: true } },
      },
    });
    if (!notebook) {
      throw new NotFoundException('Notebook not found');
    }
    if (notebook.isDefault) {
      throw new BadRequestException('Cannot delete default inbox notebook');
    }

    return this.prisma.notebook.delete({ where: { id } });
  }

  async createStack(userId: string, dto: CreateStackDto) {
    const existing = await this.prisma.notebookStack.findUnique({
      where: { userId_name: { userId, name: dto.name.trim() } },
    });
    if (existing) {
      throw new ConflictException(`Notebook stack '${dto.name}' already exists`);
    }

    return this.prisma.notebookStack.create({
      data: {
        userId,
        name: dto.name.trim(),
      },
    });
  }
}
