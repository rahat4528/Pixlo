import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { QueryArticlesDto, SaveArticleDto, RecordReadingDto } from './articles.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('articles')
@Controller('api/articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List articles with filters, pagination, and search' })
  async listArticles(@Query() query: QueryArticlesDto, @CurrentUser() user?: any) {
    return this.articlesService.listArticles(query, user?.sub);
  }

  @Get('trending')
  @ApiOperation({ summary: 'List top trending and breaking articles' })
  async getTrending(@Query('limit') limit?: number) {
    return this.articlesService.getTrendingArticles(limit ? Number(limit) : 6);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List saved/bookmarked articles for authenticated user' })
  async listSaved(@CurrentUser() user: any) {
    return this.articlesService.listSavedArticles(user.sub);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reading history for authenticated user' })
  async listHistory(@CurrentUser() user: any) {
    return this.articlesService.listReadingHistory(user.sub);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get article details and related coverage' })
  async getArticle(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.articlesService.getArticleById(id, user?.sub);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark/save an article' })
  async saveArticle(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SaveArticleDto,
  ) {
    return this.articlesService.saveArticle(user.sub, id, dto);
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an article from saved list' })
  async unsaveArticle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.unsaveArticle(user.sub, id);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log reading engagement history' })
  async recordReading(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RecordReadingDto,
  ) {
    return this.articlesService.recordReading(user.sub, id, dto);
  }
}
