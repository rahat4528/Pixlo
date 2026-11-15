import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { FeedsModule } from './modules/feeds/feeds.module';
import { EngagementModule } from './modules/engagement/engagement.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SyndicationModule } from './modules/syndication/syndication.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    AuthModule,
    AuthorsModule,
    ArticlesModule,
    PublicationsModule,
    FeedsModule,
    EngagementModule,
    AnalyticsModule,
    SyndicationModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
