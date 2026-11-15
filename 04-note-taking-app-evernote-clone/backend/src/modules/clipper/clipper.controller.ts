import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClipperService } from './clipper.service';
import { ClipUrlDto } from './clipper.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('clipper')
@Controller('api/clipper')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClipperController {
  constructor(private clipperService: ClipperService) {}

  @Post()
  @ApiOperation({ summary: 'Clip a remote web article and store as note (SSRF-protected)' })
  async clipWebPage(@CurrentUser() user: any, @Body() dto: ClipUrlDto) {
    return this.clipperService.clipWebPage(user.sub, dto);
  }
}
