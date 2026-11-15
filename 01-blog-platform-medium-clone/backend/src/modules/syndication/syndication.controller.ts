import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { SyndicationService } from './syndication.service';

@Controller('syndication')
export class SyndicationController {
  constructor(private readonly syndicationService: SyndicationService) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const xml = await this.syndicationService.generateSitemapXml();
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('rss/author/:username')
  async getAuthorRss(@Param('username') username: string, @Res() res: Response) {
    const xml = await this.syndicationService.generateAuthorRss(username);
    res.setHeader('Content-Type', 'application/rss+xml');
    res.send(xml);
  }

  @Get('rss/publication/:slug')
  async getPublicationRss(@Param('slug') slug: string, @Res() res: Response) {
    const xml = await this.syndicationService.generatePublicationRss(slug);
    res.setHeader('Content-Type', 'application/rss+xml');
    res.send(xml);
  }
}
