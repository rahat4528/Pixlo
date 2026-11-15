import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePublicationDto) {
    const existing = await this.prisma.publication.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('A publication with this slug already exists');
    }

    const pub = await this.prisma.publication.create({
      data: {
        userId,
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        senderName: dto.senderName,
        senderEmail: dto.senderEmail,
        doubleOptIn: dto.doubleOptIn ?? true,
      },
    });

    // Create default list
    await this.prisma.subscriberList.create({
      data: {
        publicationId: pub.id,
        name: 'All Subscribers',
        description: 'Default subscriber audience',
        isDefault: true,
      },
    });

    return pub;
  }

  async findByUser(userId: string) {
    return this.prisma.publication.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            subscribers: true,
            campaigns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const pub = await this.prisma.publication.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        _count: {
          select: {
            subscribers: { where: { status: 'CONFIRMED' } },
            campaigns: { where: { status: 'SENT' } },
          },
        },
      },
    });
    if (!pub) {
      throw new NotFoundException('Publication not found');
    }
    return pub;
  }

  async findById(id: string) {
    const pub = await this.prisma.publication.findUnique({
      where: { id },
    });
    if (!pub) {
      throw new NotFoundException('Publication not found');
    }
    return pub;
  }
}
