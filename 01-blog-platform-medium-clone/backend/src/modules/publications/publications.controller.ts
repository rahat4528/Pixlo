import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto, AddMemberDto, EditorialVerdictDto } from './publications.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: UserPayload, @Body() dto: CreatePublicationDto) {
    const data = await this.publicationsService.createPublication(user.userId, dto);
    return { success: true, data, message: 'Publication created' };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.publicationsService.getPublicationBySlug(slug);
    return { success: true, data };
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: AddMemberDto,
  ) {
    const data = await this.publicationsService.addOrUpdateMember(id, user.userId, dto);
    return { success: true, data, message: 'Publication member updated' };
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  async getSubmissions(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const data = await this.publicationsService.getPendingSubmissions(id, user.userId);
    return { success: true, data };
  }

  @Post(':id/submissions/:articleId/review')
  @UseGuards(JwtAuthGuard)
  async reviewSubmission(
    @Param('id') id: string,
    @Param('articleId') articleId: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: EditorialVerdictDto,
  ) {
    const data = await this.publicationsService.reviewSubmission(id, articleId, user.userId, dto);
    return { success: true, data, message: 'Submission review recorded' };
  }
}
