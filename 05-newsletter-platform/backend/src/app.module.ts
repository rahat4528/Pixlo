import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { SubscribersModule } from './modules/subscribers/subscribers.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PublicationsModule,
    SubscribersModule,
    TemplatesModule,
    CampaignsModule,
    AnalyticsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
