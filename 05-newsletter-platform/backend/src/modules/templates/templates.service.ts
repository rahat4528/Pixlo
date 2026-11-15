import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    if (dto.isDefault) {
      // Unset previous default
      await this.prisma.emailTemplate.updateMany({
        where: { publicationId: dto.publicationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.emailTemplate.create({
      data: {
        publicationId: dto.publicationId,
        name: dto.name,
        subjectDefault: dto.subjectDefault,
        htmlContent: dto.htmlContent,
        plainTextContent: dto.plainTextContent,
        previewText: dto.previewText,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async findByPublication(publicationId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { publicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }
}
