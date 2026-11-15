import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MealPlansModule } from './modules/meal-plans/meal-plans.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    AuthModule,
    RecipesModule,
    ReviewsModule,
    MealPlansModule,
    ShoppingListsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
