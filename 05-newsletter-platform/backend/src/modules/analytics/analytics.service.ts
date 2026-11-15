import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailEventType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private hashIp(ip?: string): string | null {
    if (!ip) return null;
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  async recordOpen(token: string, ip?: string, userAgent?: string) {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
    });
    if (!recipient) return;

    const isFirstOpen = !recipient.openedAt;

    if (isFirstOpen) {
      await this.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { openedAt: new Date() },
      });

      await this.prisma.campaign.update({
        where: { id: recipient.campaignId },
        data: { openCount: { increment: 1 } },
      });
    }

    await this.prisma.emailEvent.create({
      data: {
        campaignId: recipient.campaignId,
        campaignRecipientId: recipient.id,
        subscriberId: recipient.subscriberId,
        type: EmailEventType.OPEN,
        ipHash: this.hashIp(ip),
        userAgent: userAgent ? userAgent.substring(0, 255) : null,
      },
    });
  }

  async recordClick(token: string, targetUrl: string, ip?: string, userAgent?: string) {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
    });
    if (!recipient) return;

    const isFirstClick = !recipient.firstClickedAt;

    const updateData: any = {};
    if (!recipient.openedAt) {
      updateData.openedAt = new Date();
    }
    if (isFirstClick) {
      updateData.firstClickedAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: updateData,
      });

      const campaignUpdates: any = {};
      if (!recipient.openedAt) {
        campaignUpdates.openCount = { increment: 1 };
      }
      if (isFirstClick) {
        campaignUpdates.clickCount = { increment: 1 };
      }

      await this.prisma.campaign.update({
        where: { id: recipient.campaignId },
        data: campaignUpdates,
      });
    }

    await this.prisma.emailEvent.create({
      data: {
        campaignId: recipient.campaignId,
        campaignRecipientId: recipient.id,
        subscriberId: recipient.subscriberId,
        type: EmailEventType.CLICK,
        url: targetUrl,
        ipHash: this.hashIp(ip),
        userAgent: userAgent ? userAgent.substring(0, 255) : null,
      },
    });
  }

  async getCampaignOverview(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        publication: { select: { id: true, name: true } },
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const deliveredCount = campaign.sentCount - campaign.bounceCount;
    const openRate = deliveredCount > 0 ? (campaign.openCount / deliveredCount) * 100 : 0;
    const clickThroughRate = deliveredCount > 0 ? (campaign.clickCount / deliveredCount) * 100 : 0;
    const clickToOpenRate = campaign.openCount > 0 ? (campaign.clickCount / campaign.openCount) * 100 : 0;

    // Aggregate clicked links
    const clickEvents = await this.prisma.emailEvent.findMany({
      where: { campaignId, type: EmailEventType.CLICK, url: { not: null } },
      select: { url: true },
    });

    const linkCounts: Record<string, number> = {};
    for (const e of clickEvents) {
      if (e.url) {
        linkCounts[e.url] = (linkCounts[e.url] || 0) + 1;
      }
    }

    const topLinks = Object.entries(linkCounts)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        status: campaign.status,
        sendStartedAt: campaign.sendStartedAt,
        sendCompletedAt: campaign.sendCompletedAt,
      },
      metrics: {
        totalRecipients: campaign.totalRecipients,
        sentCount: campaign.sentCount,
        deliveredCount: Math.max(0, deliveredCount),
        bounceCount: campaign.bounceCount,
        uniqueOpens: campaign.openCount,
        openRate: Math.round(openRate * 10) / 10,
        uniqueClicks: campaign.clickCount,
        clickThroughRate: Math.round(clickThroughRate * 10) / 10,
        clickToOpenRate: Math.round(clickToOpenRate * 10) / 10,
        unsubscribeCount: campaign.unsubscribeCount,
      },
      topLinks,
    };
  }
}
