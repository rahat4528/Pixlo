import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ShoppingListsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLists(userId: string) {
    return this.prisma.shoppingList.findMany({
      where: { userId },
      include: {
        items: { orderBy: { ingredientName: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getListById(id: string, userId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
      include: {
        items: { orderBy: { ingredientName: 'asc' } },
      },
    });

    if (!list || list.userId !== userId) {
      throw new NotFoundException('Shopping list not found');
    }

    return list;
  }

  async toggleItemCompletion(itemId: string, userId: string) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { shoppingList: true },
    });

    if (!item || item.shoppingList.userId !== userId) {
      throw new NotFoundException('Shopping list item not found');
    }

    return this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted },
    });
  }
}
