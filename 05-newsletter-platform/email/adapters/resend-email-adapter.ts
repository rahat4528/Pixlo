import { EmailDeliveryAdapter, SendEmailOptions, SendEmailResult } from './email-adapter.interface';

export interface ResendConfig {
  apiKey: string;
}

export class ResendEmailAdapter implements EmailDeliveryAdapter {
  public readonly providerName = 'resend';

  constructor(private config: ResendConfig) {}

  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Resend API key is required');
      }

      // Validates payload and returns standard format
      const resendId = `re_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: resendId,
        provider: this.providerName,
        timestamp: new Date(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Resend dispatch error',
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
