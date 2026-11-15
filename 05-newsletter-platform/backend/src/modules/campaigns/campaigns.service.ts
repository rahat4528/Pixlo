import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { SendTestEmailDto } from './dto/send-test.dto';
import { CampaignStatus, RecipientStatus, SubscriberStatus } from '@prisma/client';
import { CampaignDispatcher } from '../../../../workers/campaign-dispatcher';
import { BatchSenderWorker } from '../../../../workers/batch-sender.worker';
import { MockEmailAdapter } from '../../../../email/adapters/mock-email-adapter';
import { SmtpEmailAdapter } from '../../../../email/adapters/smtp-email-adapter';
import { EmailDeliveryAdapter } from '../../../../email/adapters/email-adapter.interface';

@Injectable()
export class CampaignsService {
  private dispatcher = new CampaignDispatcher();
  private defaultAdapter: EmailDeliveryAdapter;

  constructor(private prisma: PrismaService) {
    if (process.env.EMAIL_PROVIDER === 'smtp') {
      this.defaultAdapter = new SmtpEmailAdapter({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        secure: process.env.SMTP_SECURE === 'true',
      });
    } else {
      this.defaultAdapter = new MockEmailAdapter();
    }
  }

  async create(dto: CreateCampaignDto) {
    const status = dto.scheduledFor ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT;

    return this.prisma.campaign.create({
      data: {
        publicationId: dto.publicationId,
        templateId: dto.templateId,
        title: dto.title,
        subject: dto.subject,
        previewText: dto.previewText,
        htmlBody: dto.htmlBody,
        plainTextBody: dto.plainTextBody,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        status,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCampaignDto>) {
    const campaign = await this.findById(id);
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Cannot edit a campaign that has already been queued or sent');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: {
        title: dto.title ?? campaign.title,
        subject: dto.subject ?? campaign.subject,
        previewText: dto.previewText ?? campaign.previewText,
        htmlBody: dto.htmlBody ?? campaign.htmlBody,
        plainTextBody: dto.plainTextBody ?? campaign.plainTextBody,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : campaign.scheduledFor,
        templateId: dto.templateId ?? campaign.templateId,
      },
    });
  }

  async findById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        publication: true,
        template: true,
        _count: {
          select: { recipients: true, events: true },
        },
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async findByPublication(publicationId: string, status?: CampaignStatus) {
    const where: any = { publicationId };
    if (status) {
      where.status = status;
    }
    return this.prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    });
  }

  async sendTest(campaignId: string, dto: SendTestEmailDto) {
    const campaign = await this.findById(campaignId);
    const publication = campaign.publication;

    const worker = new BatchSenderWorker(this.defaultAdapter, {
      rateLimitPerSec: 0,
      baseUrl: process.env.BACKEND_URL || 'http://localhost:4005',
    });

    const testRecipient = {
      subscriberId: 'test-recipient',
      email: dto.recipientEmail,
      firstName: 'Preview',
      lastName: 'Tester',
      trackingToken: `test_${Date.now()}`,
    };

    const res = await worker.processBatch(
      [testRecipient],
      {
        id: campaign.id,
        subject: `[PREVIEW] ${campaign.subject}`,
        previewText: campaign.previewText,
        htmlBody: campaign.htmlBody,
        plainTextBody: campaign.plainTextBody,
      },
      {
        id: publication.id,
        name: publication.name,
        senderName: publication.senderName,
        senderEmail: publication.senderEmail,
        websiteUrl: publication.websiteUrl,
      }
    );

    return {
      success: res.totalSucceeded > 0,
      recipient: dto.recipientEmail,
      details: res.results[0],
    };
  }

  async dispatch(campaignId: string) {
    const campaign = await this.findById(campaignId);
    if (!this.dispatcher.canTransition(campaign.status, CampaignStatus.QUEUED)) {
      throw new BadRequestException(`Cannot dispatch campaign in status ${campaign.status}`);
    }

    const publication = campaign.publication;

    // 1. Fetch eligible confirmed subscribers
    const subscribers = await this.prisma.subscriber.findMany({
      where: {
        publicationId: publication.id,
        status: SubscriberStatus.CONFIRMED,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    // 2. Fetch publication suppressions
    const suppressions = await this.prisma.suppressionEntry.findMany({
      where: { publicationId: publication.id },
      select: { email: true },
    });
    const suppressedSet = new Set(suppressions.map(s => s.email.toLowerCase()));

    // 3. Prepare batches
    const prepared = this.dispatcher.prepareRecipients(subscribers, suppressedSet, 100);

    // 4. Update campaign to QUEUED then SENDING
    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.SENDING,
        sendStartedAt: new Date(),
        totalRecipients: prepared.eligible.length,
      },
    });

    // 5. Create recipient records
    for (const r of prepared.eligible) {
      await this.prisma.campaignRecipient.upsert({
        where: {
          campaignId_subscriberId: {
            campaignId: campaign.id,
            subscriberId: r.subscriberId,
          },
        },
        create: {
          campaignId: campaign.id,
          subscriberId: r.subscriberId,
          status: RecipientStatus.PENDING,
          trackingToken: r.trackingToken,
        },
        update: {
          trackingToken: r.trackingToken,
          status: RecipientStatus.PENDING,
        },
      });
    }

    // 6. Process sending
    const worker = new BatchSenderWorker(this.defaultAdapter, {
      rateLimitPerSec: parseInt(process.env.DISPATCH_RATE_LIMIT || '50', 10),
      baseUrl: process.env.BACKEND_URL || 'http://localhost:4005',
    });

    let sentSuccess = 0;
    for (const batch of prepared.batches) {
      const batchResult = await worker.processBatch(
        batch,
        {
          id: campaign.id,
          subject: campaign.subject,
          previewText: campaign.previewText,
          htmlBody: campaign.htmlBody,
          plainTextBody: campaign.plainTextBody,
        },
        {
          id: publication.id,
          name: publication.name,
          senderName: publication.senderName,
          senderEmail: publication.senderEmail,
          websiteUrl: publication.websiteUrl,
        },
        suppressedSet
      );

      // Update recipient statuses
      for (const res of batchResult.results) {
        if (res.success) {
          sentSuccess++;
          await this.prisma.campaignRecipient.updateMany({
            where: { campaignId: campaign.id, subscriberId: res.subscriberId },
            data: { status: RecipientStatus.SENT, sentAt: new Date() },
          });
        } else {
          await this.prisma.campaignRecipient.updateMany({
            where: { campaignId: campaign.id, subscriberId: res.subscriberId },
            data: { status: RecipientStatus.FAILED, errorMessage: res.error },
          });
        }
      }
    }

    // 7. Mark campaign SENT
    return this.prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: CampaignStatus.SENT,
        sendCompletedAt: new Date(),
        sentCount: sentSuccess,
      },
    });
  }

  async cancel(campaignId: string) {
    const campaign = await this.findById(campaignId);
    if (!this.dispatcher.canTransition(campaign.status, CampaignStatus.CANCELLED)) {
      throw new BadRequestException(`Cannot cancel campaign in status ${campaign.status}`);
    }

    return this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.CANCELLED },
    });
  }
}
