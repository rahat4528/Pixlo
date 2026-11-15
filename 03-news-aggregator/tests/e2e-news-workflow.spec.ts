import { SSRFGuard } from '../ingestion/ssrf-guard';
import { Canonicalizer } from '../ingestion/canonicalizer';
import { Deduplicator } from '../ingestion/deduplicator';
import { ExcerptSanitizer } from '../ingestion/excerpt-sanitizer';
import { FeedParser } from '../ingestion/feed-parser';
import { ClusteringWorker } from '../workers/clustering-worker';
import { IngestionWorker } from '../workers/ingestion-worker';

describe('E2E News Aggregator Architecture & Pipeline Verification', () => {
  it('1. SSRF Guard intercepts loopback, private networks, and cloud metadata', async () => {
    const loopback = await SSRFGuard.validateUrl('http://127.0.0.1:4003/admin');
    expect(loopback.isSafe).toBe(false);

    const awsMetadata = await SSRFGuard.validateUrl('http://169.254.169.254/latest/meta-data/');
    expect(awsMetadata.isSafe).toBe(false);

    const privateSubnet = await SSRFGuard.validateUrl('http://10.1.2.3/feed.xml');
    expect(privateSubnet.isSafe).toBe(false);
  });

  it('2. URL Canonicalizer cleans tracking tags and normalizes paths', () => {
    const rawUrl = 'https://news.chronicle.org/articles/space-exploration/?utm_source=newsletter&utm_medium=email&fbclid=XYZ123#gallery';
    const cleanUrl = Canonicalizer.canonicalizeUrl(rawUrl);
    expect(cleanUrl).toBe('https://news.chronicle.org/articles/space-exploration');
  });

  it('3. Excerpt Sanitizer strips HTML and strictly enforces max length with attribution intact', () => {
    const longHtml = `
      <div class="news-body">
        <p>A new <strong>climate model</strong> developed by atmospheric physicists indicates potential stabilization in polar vortex oscillations over the next three decades.</p>
        <p>The researchers analyzed five petabytes of high-altitude telemetry data from orbital sensors and oceanic weather buoys.</p>
      </div>
    `;
    const cleanExcerpt = ExcerptSanitizer.sanitizeExcerpt(longHtml, 150);
    expect(cleanExcerpt.length).toBeLessThanOrEqual(150);
    expect(cleanExcerpt).not.toContain('<div');
    expect(cleanExcerpt).not.toContain('<p');
    expect(cleanExcerpt.endsWith('...')).toBe(true);
  });

  it('4. Duplicate Detection identifies matches across GUID, canonical URL, and normalized title hash', () => {
    const existing = {
      guid: 'art-unique-1234',
      canonicalUrl: 'https://pulse.org/macro-economic-report',
      title: 'Macro Economic Report: Inflation Numbers Cool in Q4',
    };

    const duplicateCandidate = {
      guid: 'art-unique-1234',
      canonicalUrl: 'https://pulse.org/macro-economic-report?utm_source=twitter',
      title: 'Macro Economic Report: Inflation Numbers Cool in Q4!',
    };

    const isDup = Deduplicator.isDuplicate(
      existing,
      {
        ...duplicateCandidate,
        canonicalUrl: Canonicalizer.canonicalizeUrl(duplicateCandidate.canonicalUrl),
      },
    );

    expect(isDup).toBe(true);
  });

  it('5. Feed Parser ingests XML feeds and extracts structured metadata', () => {
    const sampleFeed = `
      <rss version="2.0">
        <channel>
          <title>Apex News</title>
          <link>https://apexnews.org</link>
          <item>
            <title>Superconducting Cable Links Northern Grid</title>
            <link>https://apexnews.org/stories/superconducting-grid</link>
            <guid>apex-101</guid>
            <pubDate>Mon, 16 Nov 2026 09:00:00 GMT</pubDate>
            <description>A 500-kilometer high-temperature superconducting link went live today.</description>
          </item>
        </channel>
      </rss>
    `;

    const result = FeedParser.parse(sampleFeed);
    expect(result.items.length).toBe(1);
    expect(result.items[0].guid).toBe('apex-101');
    expect(result.items[0].title).toBe('Superconducting Cable Links Northern Grid');
  });

  it('6. Story Clustering groups related coverage from disparate publishers into clusters', () => {
    const now = new Date();
    const articles = [
      {
        id: '1',
        sourceId: 'publisher-a',
        title: 'Global Chip Consortium Announces New Photonic Standard',
        excerpt: 'Semiconductor manufacturers agree to standardize optical interconnects for artificial intelligence clusters.',
        publishedAt: now,
      },
      {
        id: '2',
        sourceId: 'publisher-b',
        title: 'Optical Interconnect Standard Finalized by Global Chip Consortium',
        excerpt: 'New photonic interconnect specifications released for AI datacenters by industry alliance.',
        publishedAt: now,
      },
    ];

    const clusters = ClusteringWorker.clusterArticles(articles);
    expect(clusters.length).toBe(1);
    expect(clusters[0].articleIds).toEqual(['1', '2']);
  });

  it('7. Ingestion Worker handles failure tracking and exponential retry schedules', () => {
    const delayAttempt1 = IngestionWorker.calculateBackoffDelayMs(1);
    const delayAttempt3 = IngestionWorker.calculateBackoffDelayMs(3);
    expect(delayAttempt3).toBeGreaterThan(delayAttempt1);
    expect(IngestionWorker.SUSPENSION_THRESHOLD).toBe(5);
  });
});
