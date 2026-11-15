import { Module } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MealPlansController],
  providers: [MealPlansService, PrismaService],
  exports: [MealPlansService],
})
export class MealPlansModule {}
