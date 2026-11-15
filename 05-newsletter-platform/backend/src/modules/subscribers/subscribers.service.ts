import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { SubscriberStatus, SuppressionReason } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SubscribersService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeDto, clientIp?: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id: dto.publicationId },
    });
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    // Check suppression list
    const suppressed = await this.prisma.suppressionEntry.findUnique({
      where: {
        publicationId_email: {
          publicationId: dto.publicationId,
          email: dto.email.toLowerCase(),
        },
      },
    });
    if (suppressed) {
      throw new BadRequestException('This email address is suppressed from receiving mail from this publication');
    }

    const existing = await this.prisma.subscriber.findUnique({
      where: {
        publicationId_email: {
          publicationId: dto.publicationId,
          email: dto.email.toLowerCase(),
        },
      },
    });

    if (existing && existing.status === SubscriberStatus.CONFIRMED) {
      return {
        status: SubscriberStatus.CONFIRMED,
        message: 'You are already subscribed to this publication.',
      };
    }

    const confirmationToken = `opt_${crypto.randomBytes(24).toString('hex')}`;
    const initialStatus = publication.doubleOptIn
      ? SubscriberStatus.PENDING_CONFIRMATION
      : SubscriberStatus.CONFIRMED;

    const subscriber = await this.prisma.subscriber.upsert({
      where: {
        publicationId_email: {
          publicationId: dto.publicationId,
          email: dto.email.toLowerCase(),
        },
      },
      create: {
        publicationId: dto.publicationId,
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: initialStatus,
        optInIp: clientIp,
        confirmationToken: publication.doubleOptIn ? confirmationToken : null,
        confirmedAt: publication.doubleOptIn ? null : new Date(),
      },
      update: {
        firstName: dto.firstName ?? existing?.firstName,
        lastName: dto.lastName ?? existing?.lastName,
        status: initialStatus,
        confirmationToken: publication.doubleOptIn ? confirmationToken : null,
        unsubscribedAt: null,
        unsubscribeReason: null,
      },
    });

    // Add to default list if confirmed immediately
    if (initialStatus === SubscriberStatus.CONFIRMED) {
      const defaultList = await this.prisma.subscriberList.findFirst({
        where: { publicationId: dto.publicationId, isDefault: true },
      });
      if (defaultList) {
        await this.prisma.subscriberListMembership.upsert({
          where: {
            subscriberId_listId: {
              subscriberId: subscriber.id,
              listId: defaultList.id,
            },
          },
          create: { subscriberId: subscriber.id, listId: defaultList.id },
          update: {},
        });
      }
    }

    return {
      status: subscriber.status,
      confirmationToken: publication.doubleOptIn ? confirmationToken : undefined,
      message: publication.doubleOptIn
        ? `A verification email has been dispatched to ${dto.email}. Please click the link to confirm.`
        : `Successfully subscribed to ${publication.name}!`,
    };
  }

  async confirm(token: string) {
    const subscriber = await this.prisma.subscriber.findUnique({
      where: { confirmationToken: token },
      include: { publication: true },
    });

    if (!subscriber) {
      throw new BadRequestException('Invalid or expired confirmation token');
    }

    if (subscriber.status === SubscriberStatus.CONFIRMED) {
      return {
        status: SubscriberStatus.CONFIRMED,
        publicationName: subscriber.publication.name,
        message: 'Your subscription is already confirmed.',
      };
    }

    const updated = await this.prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmationToken: null,
      },
    });

    // Add to default list
    const defaultList = await this.prisma.subscriberList.findFirst({
      where: { publicationId: subscriber.publicationId, isDefault: true },
    });
    if (defaultList) {
      await this.prisma.subscriberListMembership.upsert({
        where: {
          subscriberId_listId: {
            subscriberId: updated.id,
            listId: defaultList.id,
          },
        },
        create: { subscriberId: updated.id, listId: defaultList.id },
        update: {},
      });
    }

    return {
      status: SubscriberStatus.CONFIRMED,
      publicationName: subscriber.publication.name,
      message: `Your subscription to ${subscriber.publication.name} has been confirmed. Welcome!`,
    };
  }

  async unsubscribe(token: string, reason?: string) {
    // 1. Look up token in recipient records or unsubscribe tokens
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
      include: { subscriber: true, campaign: true },
    });

    let subscriberId: string;
    let publicationId: string;
    let email: string;

    if (recipient) {
      subscriberId = recipient.subscriberId;
      publicationId = recipient.campaign.publicationId;
      email = recipient.subscriber.email;
    } else {
      const directToken = await this.prisma.unsubscribeToken.findUnique({
        where: { token },
      });
      if (!directToken) {
        throw new BadRequestException('Invalid unsubscription token');
      }
      subscriberId = directToken.subscriberId;
      publicationId = directToken.publicationId;
      const sub = await this.prisma.subscriber.findUnique({ where: { id: subscriberId } });
      if (!sub) throw new NotFoundException('Subscriber not found');
      email = sub.email;
    }

    // Update subscriber
    await this.prisma.subscriber.update({
      where: { id: subscriberId },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || 'One-click unsubscribe',
      },
    });

    // Add to suppression list
    await this.prisma.suppressionEntry.upsert({
      where: {
        publicationId_email: {
          publicationId,
          email: email.toLowerCase(),
        },
      },
      create: {
        publicationId,
        email: email.toLowerCase(),
        reason: SuppressionReason.UNSUBSCRIBE,
        detail: reason || 'One-click unsubscribe link',
      },
      update: {
        reason: SuppressionReason.UNSUBSCRIBE,
        detail: reason || 'One-click unsubscribe link',
      },
    });

    return {
      status: 'UNSUBSCRIBED',
      message: 'You have been successfully unsubscribed from future communications.',
    };
  }

  async findByPublication(
    publicationId: string,
    status?: SubscriberStatus,
    search?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { publicationId };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.subscriber.count({ where }),
      this.prisma.subscriber.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async bulkImport(dto: BulkImportDto) {
    let created = 0;
    let skipped = 0;

    for (const item of dto.subscribers) {
      try {
        const sub = await this.prisma.subscriber.upsert({
          where: {
            publicationId_email: {
              publicationId: dto.publicationId,
              email: item.email.toLowerCase(),
            },
          },
          create: {
            publicationId: dto.publicationId,
            email: item.email.toLowerCase(),
            firstName: item.firstName,
            lastName: item.lastName,
            status: SubscriberStatus.CONFIRMED,
            confirmedAt: new Date(),
          },
          update: {
            firstName: item.firstName,
            lastName: item.lastName,
          },
        });

        if (dto.listId) {
          await this.prisma.subscriberListMembership.upsert({
            where: {
              subscriberId_listId: {
                subscriberId: sub.id,
                listId: dto.listId,
              },
            },
            create: { subscriberId: sub.id, listId: dto.listId },
            update: {},
          });
        }
        created++;
      } catch {
        skipped++;
      }
    }

    return { importedCount: created, skippedCount: skipped };
  }
}
