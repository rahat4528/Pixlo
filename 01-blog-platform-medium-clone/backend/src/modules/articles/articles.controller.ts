import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, TransitionStatusDto } from './articles.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: UserPayload, @Body() dto: CreateArticleDto) {
    const data = await this.articlesService.createArticle(user.userId, dto);
    return { success: true, data, message: 'Article created as draft' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateArticleDto,
  ) {
    const data = await this.articlesService.updateArticle(id, user.userId, dto);
    return { success: true, data, message: 'Article updated' };
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  async getBySlug(@Param('slug') slug: string, @CurrentUser() user?: UserPayload) {
    const data = await this.articlesService.getArticleBySlug(slug, user?.userId);
    return { success: true, data };
  }

  @Post(':id/transition')
  @UseGuards(JwtAuthGuard)
  async transition(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: TransitionStatusDto,
  ) {
    const data = await this.articlesService.transitionStatus(id, user.userId, dto);
    return { success: true, data, message: `Article status changed to ${dto.targetStatus}` };
  }

  @Get(':id/revisions')
  @UseGuards(JwtAuthGuard)
  async getRevisions(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const data = await this.articlesService.getRevisions(id, user.userId);
    return { success: true, data };
  }

  @Post(':id/revisions/:version/restore')
  @UseGuards(JwtAuthGuard)
  async restoreRevision(
    @Param('id') id: string,
    @Param('version') version: string,
    @CurrentUser() user: UserPayload,
  ) {
    const data = await this.articlesService.restoreRevision(id, parseInt(version, 10), user.userId);
    return { success: true, data, message: `Restored to revision v${version}` };
  }
}
