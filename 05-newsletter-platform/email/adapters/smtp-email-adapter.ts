import { EmailDeliveryAdapter, SendEmailOptions, SendEmailResult } from './email-adapter.interface';
import * as nodemailer from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

export class SmtpEmailAdapter implements EmailDeliveryAdapter {
  public readonly providerName = 'smtp';
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: SmtpConfig) {}

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure || false,
        auth: this.config.user
          ? {
              user: this.config.user,
              pass: this.config.pass,
            }
          : undefined,
      });
    }
    return this.transporter;
  }

  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${options.from.name}" <${options.from.email}>`,
        to: options.to.name ? `"${options.to.name}" <${options.to.email}>` : options.to.email,
        subject: options.subject,
        html: options.html,
        text: options.text,
        headers: options.headers,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.providerName,
        timestamp: new Date(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'SMTP dispatch error',
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
