import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class SyndicationService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSitemapXml(baseUrl: string = 'https://pixlo.local'): Promise<string> {
    const articles = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5000,
    });

    const authors = await this.prisma.authorProfile.findMany({
      select: { username: true, updatedAt: true },
      take: 1000,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static / Core routes
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>\n`;

    // Articles
    for (const art of articles) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/story/${art.slug}</loc>\n`;
      xml += `    <lastmod>${art.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Authors
    for (const a of authors) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/@${a.username}</loc>\n`;
      xml += `    <lastmod>${a.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  async generateAuthorRss(username: string, baseUrl: string = 'https://pixlo.local'): Promise<string> {
    const profile = await this.prisma.authorProfile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        user: {
          include: {
            articles: {
              where: { status: ArticleStatus.PUBLISHED },
              orderBy: { publishedAt: 'desc' },
              take: 20,
            },
          },
        },
      },
    });

    if (!profile) throw new NotFoundException(`Author @${username} not found`);

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>${profile.displayName} — Articles</title>\n`;
    rss += `    <link>${baseUrl}/@${profile.username}</link>\n`;
    rss += `    <description>${profile.bio || 'Author publications on Pixlo'}</description>\n`;
    rss += `    <language>en-us</language>\n`;

    for (const art of profile.user.articles) {
      rss += `    <item>\n`;
      rss += `      <title><![CDATA[${art.title}]]></title>\n`;
      rss += `      <link>${baseUrl}/story/${art.slug}</link>\n`;
      rss += `      <guid>${baseUrl}/story/${art.slug}</guid>\n`;
      rss += `      <pubDate>${(art.publishedAt || art.createdAt).toUTCString()}</pubDate>\n`;
      rss += `      <description><![CDATA[${art.excerpt || ''}]]></description>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>`;
    return rss;
  }

  async generatePublicationRss(slug: string, baseUrl: string = 'https://pixlo.local'): Promise<string> {
    const pub = await this.prisma.publication.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        articles: {
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!pub) throw new NotFoundException(`Publication ${slug} not found`);

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    rss += `  <channel>\n`;
    rss += `    <title>${pub.name} — Publication Feed</title>\n`;
    rss += `    <link>${baseUrl}/publication/${pub.slug}</link>\n`;
    rss += `    <description>${pub.description || 'Publication on Pixlo'}</description>\n`;
    rss += `    <language>en-us</language>\n`;

    for (const art of pub.articles) {
      rss += `    <item>\n`;
      rss += `      <title><![CDATA[${art.title}]]></title>\n`;
      rss += `      <link>${baseUrl}/story/${art.slug}</link>\n`;
      rss += `      <guid>${baseUrl}/story/${art.slug}</guid>\n`;
      rss += `      <pubDate>${(art.publishedAt || art.createdAt).toUTCString()}</pubDate>\n`;
      rss += `      <description><![CDATA[${art.excerpt || ''}]]></description>\n`;
      rss += `    </item>\n`;
    }

    rss += `  </channel>\n`;
    rss += `</rss>`;
    return rss;
  }
}
