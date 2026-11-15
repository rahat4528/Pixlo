import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { SourcesModule } from './modules/sources/sources.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ClustersModule } from './modules/clusters/clusters.module';
import { PersonalizationModule } from './modules/personalization/personalization.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    AuthModule,
    SourcesModule,
    ArticlesModule,
    ClustersModule,
    PersonalizationModule,
    IngestionModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
