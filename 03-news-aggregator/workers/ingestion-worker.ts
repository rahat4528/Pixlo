import { SSRFGuard } from '../ingestion/ssrf-guard';
import { FeedParser, ParsedFeedItem } from '../ingestion/feed-parser';
import { Canonicalizer } from '../ingestion/canonicalizer';
import { Deduplicator } from '../ingestion/deduplicator';
import { ExcerptSanitizer } from '../ingestion/excerpt-sanitizer';

export interface IngestionConfig {
  timeoutMs?: number;
  maxSizeBytes?: number;
  maxExcerptLength?: number;
  consecutiveFailuresBeforeSuspension?: number;
}

export interface IngestItemResult {
  guid: string;
  title: string;
  normalizedTitleHash: string;
  canonicalUrl: string;
  originalUrl: string;
  excerpt: string;
  authorName?: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface IngestFeedResult {
  success: boolean;
  httpStatus?: number;
  etag?: string;
  lastModified?: string;
  itemsFound: number;
  items: IngestItemResult[];
  errorMessage?: string;
  isNotModified?: boolean;
}

export class IngestionWorker {
  static readonly DEFAULT_TIMEOUT_MS = 8000;
  static readonly DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  static readonly SUSPENSION_THRESHOLD = 5;

  /**
   * Calculates next retry delay in milliseconds using exponential backoff with jitter.
   */
  static calculateBackoffDelayMs(retryCount: number): number {
    // base: 2 minutes * 2^(retryCount), cap at 24 hours
    const baseMinutes = 2 * Math.pow(2, Math.min(retryCount, 7));
    const jitter = Math.floor(Math.random() * 30); // 0-30s jitter
    return (baseMinutes * 60 + jitter) * 1000;
  }

  /**
   * Fetches and parses an RSS or Atom feed with full SSRF guard, timeout, and size limits.
   */
  static async fetchAndParseFeed(
    feedUrl: string,
    options: {
      etag?: string | null;
      lastModified?: string | null;
      config?: IngestionConfig;
    } = {},
  ): Promise<IngestFeedResult> {
    const timeoutMs = options.config?.timeoutMs || this.DEFAULT_TIMEOUT_MS;
    const maxSizeBytes = options.config?.maxSizeBytes || this.DEFAULT_MAX_SIZE_BYTES;
    const maxExcerpt = options.config?.maxExcerptLength || ExcerptSanitizer.DEFAULT_MAX_LENGTH;

    // 1. SSRF Guard Pre-check
    const ssrfResult = await SSRFGuard.validateUrl(feedUrl);
    if (!ssrfResult.isSafe) {
      return {
        success: false,
        itemsFound: 0,
        items: [],
        errorMessage: `SSRF validation failed: ${ssrfResult.error}`,
      };
    }

    // 2. Prepare HTTP headers
    const headers: Record<string, string> = {
      'User-Agent': 'PixloNewsBot/1.0 (+https://pixlo.news/bot)',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    };

    if (options.etag) {
      headers['If-None-Match'] = options.etag;
    }
    if (options.lastModified) {
      headers['If-Modified-Since'] = options.lastModified;
    }

    // 3. Execute Fetch with AbortController
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(feedUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      if (response.status === 304) {
        return {
          success: true,
          httpStatus: 304,
          isNotModified: true,
          itemsFound: 0,
          items: [],
        };
      }

      if (!response.ok) {
        return {
          success: false,
          httpStatus: response.status,
          itemsFound: 0,
          items: [],
          errorMessage: `Feed responded with HTTP status ${response.status} (${response.statusText})`,
        };
      }

      // Check Content-Length header if present
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader && parseInt(contentLengthHeader, 10) > maxSizeBytes) {
        return {
          success: false,
          httpStatus: response.status,
          itemsFound: 0,
          items: [],
          errorMessage: `Feed content-length (${contentLengthHeader} bytes) exceeds maximum allowable size (${maxSizeBytes} bytes)`,
        };
      }

      // Read response text with size limiter
      const rawText = await response.text();
      if (Buffer.byteLength(rawText, 'utf8') > maxSizeBytes) {
        return {
          success: false,
          httpStatus: response.status,
          itemsFound: 0,
          items: [],
          errorMessage: `Feed body exceeds maximum allowable payload of ${maxSizeBytes} bytes`,
        };
      }

      // Extract caching headers
      const newEtag = response.headers.get('etag') || undefined;
      const newLastModified = response.headers.get('last-modified') || undefined;

      // Parse XML items
      const parsed = FeedParser.parse(rawText);
      const processedItems: IngestItemResult[] = [];

      for (const item of parsed.items) {
        const canonical = Canonicalizer.canonicalizeUrl(item.link);
        const titleHash = Deduplicator.hashTitle(item.title);
        const cleanExcerpt = ExcerptSanitizer.sanitizeExcerpt(item.description, maxExcerpt);

        processedItems.push({
          guid: item.guid,
          title: item.title.trim(),
          normalizedTitleHash: titleHash,
          canonicalUrl: canonical,
          originalUrl: item.link,
          excerpt: cleanExcerpt,
          authorName: item.authorName,
          publishedAt: item.pubDate,
          imageUrl: item.imageUrl,
        });
      }

      return {
        success: true,
        httpStatus: response.status,
        etag: newEtag,
        lastModified: newLastModified,
        itemsFound: processedItems.length,
        items: processedItems,
      };
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        itemsFound: 0,
        items: [],
        errorMessage: isTimeout ? `Request timed out after ${timeoutMs}ms` : `Network error: ${err.message}`,
      };
    }
  }
}
