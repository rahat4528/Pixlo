import { EmailDeliveryAdapter, SendEmailOptions, SendEmailResult } from './email-adapter.interface';

export interface CapturedEmail extends SendEmailOptions {
  id: string;
  sentAt: Date;
}

export class MockEmailAdapter implements EmailDeliveryAdapter {
  public readonly providerName = 'mock';
  private sentMessages: CapturedEmail[] = [];
  private failAddresses: Set<string> = new Set();

  /**
   * Send a single message to in-memory store.
   */
  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (this.failAddresses.has(options.to.email.toLowerCase())) {
      return {
        success: false,
        provider: this.providerName,
        error: `Simulated bounce: recipient ${options.to.email} address rejected`,
        timestamp: new Date(),
      };
    }

    const messageId = `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.sentMessages.push({
      ...options,
      id: messageId,
      sentAt: new Date(),
    });

    return {
      success: true,
      messageId,
      provider: this.providerName,
      timestamp: new Date(),
    };
  }

  /**
   * Batch dispatch.
   */
  public async sendBatch(optionsList: SendEmailOptions[]): Promise<SendEmailResult[]> {
    const results: SendEmailResult[] = [];
    for (const opt of optionsList) {
      results.push(await this.send(opt));
    }
    return results;
  }

  /**
   * Helper for tests & inspection.
   */
  public getSentMessages(): CapturedEmail[] {
    return [...this.sentMessages];
  }

  public getMessagesForRecipient(email: string): CapturedEmail[] {
    return this.sentMessages.filter(m => m.to.email.toLowerCase() === email.toLowerCase());
  }

  public clear(): void {
    this.sentMessages = [];
    this.failAddresses.clear();
  }

  public simulateFailureFor(email: string): void {
    this.failAddresses.add(email.toLowerCase());
  }
}
