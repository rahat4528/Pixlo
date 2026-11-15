export interface EmailRecipient {
  email: string;
  name?: string | null;
}

export interface SendEmailOptions {
  to: EmailRecipient;
  from: {
    name: string;
    email: string;
  };
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  trackingToken?: string;
  campaignId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: Date;
}

export interface EmailDeliveryAdapter {
  readonly providerName: string;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
  sendBatch(optionsList: SendEmailOptions[]): Promise<SendEmailResult[]>;
}
