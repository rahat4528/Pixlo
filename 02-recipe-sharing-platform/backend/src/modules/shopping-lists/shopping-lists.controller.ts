import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CookUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getLists(@CurrentUser() user: CookUserPayload) {
    const data = await this.shoppingListsService.getLists(user.userId);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: CookUserPayload,
  ) {
    const data = await this.shoppingListsService.getListById(id, user.userId);
    return { success: true, data };
  }

  @Patch('items/:itemId/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: CookUserPayload,
  ) {
    const data = await this.shoppingListsService.toggleItemCompletion(itemId, user.userId);
    return { success: true, data };
  }
}
