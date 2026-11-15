import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { AddReactionDto, CreateCommentDto, ModerateCommentDto, RecordReadingHistoryDto, CreateReadingListDto } from './engagement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post('articles/:id/reactions')
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @Param('id') articleId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: AddReactionDto,
  ) {
    const data = await this.engagementService.addOrUpdateReaction(articleId, user.userId, dto);
    return { success: true, data };
  }

  @Get('articles/:id/comments')
  async getComments(@Param('id') articleId: string) {
    const data = await this.engagementService.getComments(articleId);
    return { success: true, data };
  }

  @Post('articles/:id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('id') articleId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateCommentDto,
  ) {
    const data = await this.engagementService.createComment(articleId, user.userId, dto);
    return { success: true, data, message: 'Comment submitted' };
  }

  @Post('comments/:id/moderate')
  @UseGuards(JwtAuthGuard)
  async moderateComment(
    @Param('id') commentId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: ModerateCommentDto,
  ) {
    const data = await this.engagementService.moderateComment(commentId, user.userId, dto);
    return { success: true, data, message: 'Comment moderated' };
  }

  @Post('articles/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(@Param('id') articleId: string, @CurrentUser() user: UserPayload) {
    const data = await this.engagementService.toggleBookmark(articleId, user.userId);
    return { success: true, data };
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  async getBookmarks(@CurrentUser() user: UserPayload) {
    const data = await this.engagementService.getBookmarks(user.userId);
    return { success: true, data };
  }

  @Post('articles/:id/history')
  @UseGuards(JwtAuthGuard)
  async recordHistory(
    @Param('id') articleId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: RecordReadingHistoryDto,
  ) {
    const data = await this.engagementService.recordReadingHistory(articleId, user.userId, dto);
    return { success: true, data };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser() user: UserPayload) {
    const data = await this.engagementService.getReadingHistory(user.userId);
    return { success: true, data };
  }

  @Post('reading-lists')
  @UseGuards(JwtAuthGuard)
  async createReadingList(@CurrentUser() user: UserPayload, @Body() dto: CreateReadingListDto) {
    const data = await this.engagementService.createReadingList(user.userId, dto);
    return { success: true, data };
  }

  @Post('reading-lists/:listId/articles/:articleId')
  @UseGuards(JwtAuthGuard)
  async addToList(
    @Param('listId') listId: string,
    @Param('articleId') articleId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const data = await this.engagementService.addArticleToReadingList(listId, articleId, user.userId);
    return { success: true, data };
  }
}
