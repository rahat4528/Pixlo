import { Module } from '@nestjs/common';
import { SyndicationService } from './syndication.service';
import { SyndicationController } from './syndication.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [SyndicationController],
  providers: [SyndicationService, PrismaService],
  exports: [SyndicationService],
})
export class SyndicationModule {}
