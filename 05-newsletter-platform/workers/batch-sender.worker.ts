import { EmailDeliveryAdapter } from '../email/adapters/email-adapter.interface';
import { EmailTemplateEngine, RenderOptions } from '../email/template-engine';
import { PreparedRecipient } from './campaign-dispatcher';

export interface CampaignData {
  id: string;
  subject: string;
  previewText?: string | null;
  htmlBody: string;
  plainTextBody?: string | null;
}

export interface PublicationData {
  id: string;
  name: string;
  senderName: string;
  senderEmail: string;
  websiteUrl?: string | null;
}

export interface BatchSenderConfig {
  rateLimitPerSec: number;
  baseUrl: string;
}

export interface SendBatchResult {
  totalAttempted: number;
  totalSucceeded: number;
  totalFailed: number;
  results: Array<{
    subscriberId: string;
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export class BatchSenderWorker {
  private templateEngine = new EmailTemplateEngine();

  constructor(
    private adapter: EmailDeliveryAdapter,
    private config: BatchSenderConfig
  ) {}

  public async processBatch(
    recipients: PreparedRecipient[],
    campaign: CampaignData,
    publication: PublicationData,
    suppressedEmails: Set<string> = new Set()
  ): Promise<SendBatchResult> {
    const results: SendBatchResult['results'] = [];
    let succeeded = 0;
    let failed = 0;

    for (const recipient of recipients) {
      // Dynamic safety check against newly added suppressions
      if (suppressedEmails.has(recipient.email.toLowerCase())) {
        results.push({
          subscriberId: recipient.subscriberId,
          email: recipient.email,
          success: false,
          error: 'Recipient email is present in suppression list',
        });
        failed++;
        continue;
      }

      const unsubscribeUrl = `${this.config.baseUrl}/api/subscribers/unsubscribe?token=${recipient.trackingToken}`;
      const trackingPixelUrl = `${this.config.baseUrl}/api/analytics/pixel/${recipient.trackingToken}.png`;
      const clickTrackingBaseUrl = `${this.config.baseUrl}/api/analytics/click`;

      const renderOpts: RenderOptions = {
        subscriber: {
          id: recipient.subscriberId,
          email: recipient.email,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
        },
        publication: {
          id: publication.id,
          name: publication.name,
          senderName: publication.senderName,
          senderEmail: publication.senderEmail,
          url: publication.websiteUrl,
        },
        campaign: {
          id: campaign.id,
          subject: campaign.subject,
          previewText: campaign.previewText,
        },
        unsubscribeUrl,
        trackingPixelUrl,
        clickTrackingBaseUrl,
        trackingToken: recipient.trackingToken,
      };

      const rendered = this.templateEngine.render(
        campaign.htmlBody,
        campaign.plainTextBody || null,
        renderOpts
      );

      const sendRes = await this.adapter.send({
        to: {
          email: recipient.email,
          name: [recipient.firstName, recipient.lastName].filter(Boolean).join(' ') || undefined,
        },
        from: {
          name: publication.senderName,
          email: publication.senderEmail,
        },
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.plainText,
        headers: rendered.headers,
        trackingToken: recipient.trackingToken,
        campaignId: campaign.id,
      });

      if (sendRes.success) {
        succeeded++;
        results.push({
          subscriberId: recipient.subscriberId,
          email: recipient.email,
          success: true,
          messageId: sendRes.messageId,
        });
      } else {
        failed++;
        results.push({
          subscriberId: recipient.subscriberId,
          email: recipient.email,
          success: false,
          error: sendRes.error,
        });
      }

      // Throttle based on rateLimitPerSec
      if (this.config.rateLimitPerSec > 0 && this.config.rateLimitPerSec < 1000) {
        const delayMs = Math.floor(1000 / this.config.rateLimitPerSec);
        if (delayMs > 5) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }

    return {
      totalAttempted: recipients.length,
      totalSucceeded: succeeded,
      totalFailed: failed,
      results,
    };
  }
}
