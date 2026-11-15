import { Module } from '@nestjs/common';
import { ClipperService } from './clipper.service';
import { ClipperController } from './clipper.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClipperController],
  providers: [ClipperService, PrismaService],
  exports: [ClipperService],
})
export class ClipperModule {}
