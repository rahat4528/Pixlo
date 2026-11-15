import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get('discovery')
  async getDiscovery(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('sort') sort?: 'latest' | 'top' | 'trending',
  ) {
    const data = await this.feedsService.getDiscoveryArticles({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      tag,
      category,
      author,
      sort,
    });
    return { success: true, data };
  }

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalized(@CurrentUser() user: UserPayload, @Query('limit') limit?: string) {
    const data = await this.feedsService.getPersonalizedFeed(
      user.userId,
      limit ? parseInt(limit, 10) : 20,
    );
    return { success: true, data };
  }

  @Get('search')
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    const data = await this.feedsService.searchArticles(q, limit ? parseInt(limit, 10) : 20);
    return { success: true, data };
  }

  @Get('categories')
  async getCategories() {
    const data = await this.feedsService.getCategories();
    return { success: true, data };
  }

  @Get('tags')
  async getTags() {
    const data = await this.feedsService.getTags();
    return { success: true, data };
  }
}
