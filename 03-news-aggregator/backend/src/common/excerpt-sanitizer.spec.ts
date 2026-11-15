import { ExcerptSanitizer } from '../../../ingestion/excerpt-sanitizer';

describe('ExcerptSanitizer', () => {
  it('should strip HTML tags and script elements', () => {
    const raw = '<p>The government announced a <strong>new policy</strong> today. <script>alert("hack")</script></p>';
    const cleaned = ExcerptSanitizer.sanitizeExcerpt(raw);
    expect(cleaned).toBe('The government announced a new policy today.');
    expect(cleaned).not.toContain('<p>');
    expect(cleaned).not.toContain('alert');
  });

  it('should decode HTML entities properly', () => {
    const raw = 'Tech &amp; Science: &quot;A new era begins&quot; &#39;today&#39;';
    const cleaned = ExcerptSanitizer.sanitizeExcerpt(raw);
    expect(cleaned).toBe('Tech & Science: "A new era begins" \'today\'');
  });

  it('should enforce maximum excerpt length and truncate cleanly at word boundary', () => {
    const longText = 'The National Oceanic and Atmospheric Administration deployed high-resolution undersea gliders across the North Atlantic to monitor thermo-haline circulation changes, providing oceanographers with real-time continuous salinity and temperature depth profiles for climate modeling.';
    const sanitized = ExcerptSanitizer.sanitizeExcerpt(longText, 100);
    expect(sanitized.length).toBeLessThanOrEqual(100);
    expect(sanitized.endsWith('...')).toBe(true);
    // Should not cut in the middle of a word
    expect(sanitized).not.toContain('tempera...');
  });

  it('should leave short content unaltered', () => {
    const shortText = 'Brief market update for Monday morning.';
    expect(ExcerptSanitizer.sanitizeExcerpt(shortText, 300)).toBe(shortText);
  });
});
