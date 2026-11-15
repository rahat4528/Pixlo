import { Module } from '@nestjs/common';
import { PersonalizationService } from './personalization.service';
import { PersonalizationController } from './personalization.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PersonalizationController],
  providers: [PersonalizationService, PrismaService],
  exports: [PersonalizationService],
})
export class PersonalizationModule {}
