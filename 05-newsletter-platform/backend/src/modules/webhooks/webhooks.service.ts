import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BounceProcessor } from '../../../../workers/bounce-processor';
import { SubscriberStatus, SuppressionReason, EmailEventType } from '@prisma/client';

export interface ProviderWebhookPayload {
  event: 'bounce' | 'complaint' | 'delivered';
  email: string;
  publicationId: string;
  campaignId?: string;
  bounceType?: 'hard' | 'soft';
  diagnosticCode?: string;
  feedbackType?: string;
}

@Injectable()
export class WebhooksService {
  private bounceProcessor = new BounceProcessor();

  constructor(private prisma: PrismaService) {}

  async handleProviderEvent(payload: ProviderWebhookPayload) {
    if (payload.event === 'bounce') {
      const action = this.bounceProcessor.handleBounce({
        email: payload.email,
        publicationId: payload.publicationId,
        campaignId: payload.campaignId,
        bounceType: payload.bounceType || 'hard',
        diagnosticCode: payload.diagnosticCode,
        timestamp: new Date(),
      });

      if (action.action === 'SUPPRESS_AND_CLEAN') {
        // Add to suppression table
        await this.prisma.suppressionEntry.upsert({
          where: {
            publicationId_email: {
              publicationId: payload.publicationId,
              email: payload.email.toLowerCase(),
            },
          },
          create: {
            publicationId: payload.publicationId,
            email: payload.email.toLowerCase(),
            reason: SuppressionReason.BOUNCE,
            detail: action.detail,
          },
          update: {
            reason: SuppressionReason.BOUNCE,
            detail: action.detail,
          },
        });

        // Mark subscriber CLEANED
        await this.prisma.subscriber.updateMany({
          where: {
            publicationId: payload.publicationId,
            email: payload.email.toLowerCase(),
          },
          data: { status: SubscriberStatus.CLEANED },
        });

        // Increment campaign bounce count
        if (payload.campaignId) {
          await this.prisma.campaign.update({
            where: { id: payload.campaignId },
            data: { bounceCount: { increment: 1 } },
          });

          await this.prisma.emailEvent.create({
            data: {
              campaignId: payload.campaignId,
              type: EmailEventType.BOUNCE,
            },
          });
        }
      }
      return { handled: true, action: action.action };
    }

    if (payload.event === 'complaint') {
      const action = this.bounceProcessor.handleComplaint({
        email: payload.email,
        publicationId: payload.publicationId,
        campaignId: payload.campaignId,
        feedbackType: payload.feedbackType,
        timestamp: new Date(),
      });

      await this.prisma.suppressionEntry.upsert({
        where: {
          publicationId_email: {
            publicationId: payload.publicationId,
            email: payload.email.toLowerCase(),
          },
        },
        create: {
          publicationId: payload.publicationId,
          email: payload.email.toLowerCase(),
          reason: SuppressionReason.COMPLAINT,
          detail: action.detail,
        },
        update: {
          reason: SuppressionReason.COMPLAINT,
          detail: action.detail,
        },
      });

      await this.prisma.subscriber.updateMany({
        where: {
          publicationId: payload.publicationId,
          email: payload.email.toLowerCase(),
        },
        data: { status: SubscriberStatus.UNSUBSCRIBED },
      });

      return { handled: true, action: 'SUPPRESS_AND_UNSUBSCRIBE' };
    }

    return { handled: true, action: 'NOOP' };
  }
}
