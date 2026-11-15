import { Canonicalizer } from '../../../ingestion/canonicalizer';

describe('Canonicalizer', () => {
  it('should strip common tracking parameters (UTM, fbclid, gclid)', () => {
    const raw = 'https://news.example.com/article/123?utm_source=twitter&utm_medium=social&utm_campaign=spring2026&fbclid=IwAR234';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/article/123');
  });

  it('should retain non-tracking query parameters and sort them alphabetically', () => {
    const raw = 'https://news.example.com/search?page=2&tag=ai&utm_source=rss';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/search?page=2&tag=ai');
  });

  it('should downcase hostname and remove default ports', () => {
    const raw = 'HTTPS://NEWS.EXAMPLE.COM:443/world/europe/';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/world/europe');
  });

  it('should strip URL hash fragments', () => {
    const raw = 'https://news.example.com/story/tech#comments-section';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/story/tech');
  });

  it('should normalize trailing slashes on non-root paths', () => {
    const raw = 'https://news.example.com/business/markets/';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/business/markets');
  });

  it('should preserve root slash', () => {
    const raw = 'https://news.example.com/';
    const canonical = Canonicalizer.canonicalizeUrl(raw);
    expect(canonical).toBe('https://news.example.com/');
  });
});
