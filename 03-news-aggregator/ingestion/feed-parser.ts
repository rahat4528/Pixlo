import { XMLParser } from 'fast-xml-parser';

export interface ParsedFeedItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  authorName?: string;
  imageUrl?: string;
  categories?: string[];
}

export interface ParsedFeedResult {
  title: string;
  link?: string;
  description?: string;
  items: ParsedFeedItem[];
}

export class FeedParser {
  private static readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    parseAttributeValue: false,
    cdataPropName: '__cdata',
  });

  private static extractText(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      if (val.__cdata) return String(val.__cdata);
      if (val['#text']) return String(val['#text']);
      if (val['@_href']) return String(val['@_href']);
    }
    return '';
  }

  static parse(xmlContent: string): ParsedFeedResult {
    if (!xmlContent || typeof xmlContent !== 'string') {
      throw new Error('Empty or invalid XML feed content');
    }

    let parsedObj: any;
    try {
      parsedObj = this.xmlParser.parse(xmlContent);
    } catch (err: any) {
      throw new Error(`Failed to parse XML: ${err.message}`);
    }

    // 1. Check for RSS 2.0 (<rss><channel>...)
    if (parsedObj.rss && parsedObj.rss.channel) {
      return this.parseRssChannel(parsedObj.rss.channel);
    }

    // 2. Check for RDF / RSS 1.0 (<rdf:RDF>...)
    if (parsedObj['rdf:RDF']) {
      return this.parseRdfFeed(parsedObj['rdf:RDF']);
    }

    // 3. Check for Atom (<feed>...)
    if (parsedObj.feed) {
      return this.parseAtomFeed(parsedObj.feed);
    }

    throw new Error('Unrecognized feed format: Expected RSS 2.0, RSS 1.0, or Atom.');
  }

  private static parseRssChannel(channel: any): ParsedFeedResult {
    const feedTitle = this.extractText(channel.title) || 'Untitled RSS Feed';
    const feedLink = this.extractText(channel.link);
    const feedDesc = this.extractText(channel.description);

    const rawItems = Array.isArray(channel.item)
      ? channel.item
      : channel.item ? [channel.item] : [];

    const items: ParsedFeedItem[] = [];

    for (const item of rawItems) {
      const title = this.extractText(item.title);
      const link = this.extractText(item.link);
      const guid = this.extractText(item.guid) || link || title;

      const rawContent =
        this.extractText(item['content:encoded']) ||
        this.extractText(item.description) ||
        this.extractText(item.summary) ||
        '';

      let pubDate = new Date();
      const rawDate = this.extractText(item.pubDate) || this.extractText(item['dc:date']);
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          pubDate = parsed;
        }
      }

      const author =
        this.extractText(item['dc:creator']) ||
        this.extractText(item.author) ||
        undefined;

      let imageUrl: string | undefined;
      if (item.enclosure && item.enclosure['@_url']) {
        const type = item.enclosure['@_type'] || '';
        if (type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure['@_url'])) {
          imageUrl = item.enclosure['@_url'];
        }
      } else if (item['media:content'] && item['media:content']['@_url']) {
        imageUrl = item['media:content']['@_url'];
      }

      if (title && (link || guid)) {
        items.push({
          guid,
          title,
          link: link || guid,
          description: rawContent,
          pubDate,
          authorName: author,
          imageUrl,
        });
      }
    }

    return { title: feedTitle, link: feedLink, description: feedDesc, items };
  }

  private static parseRdfFeed(rdf: any): ParsedFeedResult {
    const channel = rdf.channel || {};
    const feedTitle = this.extractText(channel.title) || 'Untitled RDF Feed';
    const feedLink = this.extractText(channel.link);

    const rawItems = Array.isArray(rdf.item)
      ? rdf.item
      : rdf.item ? [rdf.item] : [];

    const items: ParsedFeedItem[] = [];
    for (const item of rawItems) {
      const title = this.extractText(item.title);
      const link = this.extractText(item.link) || this.extractText(item['@_rdf:about']);
      const desc = this.extractText(item.description);
      const rawDate = this.extractText(item['dc:date']);

      let pubDate = new Date();
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) pubDate = d;
      }

      if (title && link) {
        items.push({
          guid: link,
          title,
          link,
          description: desc,
          pubDate,
          authorName: this.extractText(item['dc:creator']),
        });
      }
    }

    return { title: feedTitle, link: feedLink, items };
  }

  private static parseAtomFeed(feed: any): ParsedFeedResult {
    const feedTitle = this.extractText(feed.title) || 'Untitled Atom Feed';
    let feedLink = '';
    if (Array.isArray(feed.link)) {
      const alt = feed.link.find((l: any) => l['@_rel'] === 'alternate') || feed.link[0];
      feedLink = alt ? alt['@_href'] : '';
    } else if (feed.link && feed.link['@_href']) {
      feedLink = feed.link['@_href'];
    }

    const rawEntries = Array.isArray(feed.entry)
      ? feed.entry
      : feed.entry ? [feed.entry] : [];

    const items: ParsedFeedItem[] = [];

    for (const entry of rawEntries) {
      const title = this.extractText(entry.title);
      const guid = this.extractText(entry.id);

      let link = '';
      if (Array.isArray(entry.link)) {
        const alt = entry.link.find((l: any) => l['@_rel'] === 'alternate') || entry.link[0];
        link = alt ? alt['@_href'] : '';
      } else if (entry.link && entry.link['@_href']) {
        link = entry.link['@_href'];
      }

      const desc =
        this.extractText(entry.summary) ||
        this.extractText(entry.content) ||
        '';

      let pubDate = new Date();
      const rawDate = this.extractText(entry.published) || this.extractText(entry.updated);
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) pubDate = d;
      }

      let author: string | undefined;
      if (entry.author) {
        author = typeof entry.author === 'object' ? this.extractText(entry.author.name) : String(entry.author);
      }

      if (title && (link || guid)) {
        items.push({
          guid: guid || link,
          title,
          link: link || guid,
          description: desc,
          pubDate,
          authorName: author,
        });
      }
    }

    return { title: feedTitle, link: feedLink, items };
  }
}
