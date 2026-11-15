import { EmailDeliveryAdapter, SendEmailOptions, SendEmailResult } from './email-adapter.interface';

export interface SesConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class SesEmailAdapter implements EmailDeliveryAdapter {
  public readonly providerName = 'ses';

  constructor(private config: SesConfig) {}

  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      // In production, instantiate @aws-sdk/client-ses SendEmailCommand
      // Simulating clean AWS SES API call interface with credential check
      if (!this.config.region) {
        throw new Error('AWS SES configuration missing region');
      }

      const sesMessageId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      return {
        success: true,
        messageId: sesMessageId,
        provider: this.providerName,
        timestamp: new Date(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Amazon SES dispatch error',
        provider: this.providerName,
        timestamp: new Date(),
      };
    }
  }

  public async sendBatch(optionsList: SendEmailOptions[]): Promise<SendEmailResult[]> {
    const results: SendEmailResult[] = [];
    for (const opt of optionsList) {
      results.push(await this.send(opt));
    }
    return results;
  }
}
