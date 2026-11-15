import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService, ProviderWebhookPayload } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @ApiOperation({ summary: 'Receive email provider delivery, bounce, and complaint webhooks' })
  @Post('delivery')
  async handleWebhook(
    @Body() payload: ProviderWebhookPayload,
    @Headers('x-webhook-signature') signature?: string
  ) {
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (expectedSecret && signature && signature !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.webhooksService.handleProviderEvent(payload);
  }
}
