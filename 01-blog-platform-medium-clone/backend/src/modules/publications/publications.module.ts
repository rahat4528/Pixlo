import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PublicationsController],
  providers: [PublicationsService, PrismaService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
