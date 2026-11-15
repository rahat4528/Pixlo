import { Module } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService, PrismaService],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
