export class ExcerptSanitizer {
  static readonly DEFAULT_MAX_LENGTH = 350;

  /**
   * Sanitizes and enforces length limits on article excerpts.
   * - Strips all HTML tags and script content
   * - Unescapes common HTML entities
   * - Collapses whitespaces
   * - Truncates to maxLength at word boundary with '...'
   */
  static sanitizeExcerpt(rawContent: string, maxLength: number = this.DEFAULT_MAX_LENGTH): string {
    if (!rawContent || typeof rawContent !== 'string') {
      return '';
    }

    // Strip HTML scripts, styles, and tags
    let cleaned = rawContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ');

    // Decode standard HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));

    // Collapse whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Truncate at word boundary
    const truncated = cleaned.slice(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.6) {
      return `${truncated.slice(0, lastSpace)}...`;
    }

    return `${truncated}...`;
  }
}
