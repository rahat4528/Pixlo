import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTagDto } from './tags.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async listTags(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTag(userId: string, dto: CreateTagDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = await this.prisma.tag.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) {
      throw new ConflictException(`Tag '${dto.name}' already exists`);
    }

    return this.prisma.tag.create({
      data: {
        userId,
        name: dto.name.trim(),
        slug,
        color: dto.color || '#10b981',
      },
    });
  }

  async deleteTag(userId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return this.prisma.tag.delete({ where: { id } });
  }
}
