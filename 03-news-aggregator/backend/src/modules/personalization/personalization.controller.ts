import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonalizationService } from './personalization.service';
import { UpdatePreferencesDto } from './personalization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('personalization')
@Controller('api/personalization')
export class PersonalizationController {
  constructor(private personalizationService: PersonalizationService) {}

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve authenticated user reading preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.personalizationService.getPreferences(user.sub);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update categories, topics, and alert settings' })
  async updatePreferences(@CurrentUser() user: any, @Body() dto: UpdatePreferencesDto) {
    return this.personalizationService.updatePreferences(user.sub, dto);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve personalized algorithmically scored news feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(@CurrentUser() user: any, @Query('limit') limit?: number) {
    return this.personalizationService.getPersonalizedFeed(user.sub, limit ? Number(limit) : 30);
  }
}
