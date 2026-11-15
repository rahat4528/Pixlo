export class Canonicalizer {
  private static readonly TRACKING_PARAMS = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'fbclid',
    'gclid',
    'msclkid',
    'mc_eid',
    'mc_cid',
    'ref',
    'ref_src',
    'source',
    'feature',
    '_ga',
    '_hsenc',
    '_hsmi',
    'trk',
    'si',
  ]);

  static canonicalizeUrl(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return '';
    }

    try {
      const parsed = new URL(rawUrl.trim());

      // Lowercase protocol and host
      parsed.protocol = parsed.protocol.toLowerCase();
      parsed.hostname = parsed.hostname.toLowerCase();

      // Remove default ports
      if (
        (parsed.protocol === 'http:' && parsed.port === '80') ||
        (parsed.protocol === 'https:' && parsed.port === '443')
      ) {
        parsed.port = '';
      }

      // Remove fragment / hash
      parsed.hash = '';

      // Filter tracking query params
      const searchParams = new URLSearchParams(parsed.search);
      const remainingParams = new URLSearchParams();

      const sortedKeys = Array.from(searchParams.keys()).sort();
      for (const key of sortedKeys) {
        if (!this.TRACKING_PARAMS.has(key.toLowerCase())) {
          const values = searchParams.getAll(key);
          for (const val of values) {
            remainingParams.append(key, val);
          }
        }
      }

      const queryString = remainingParams.toString();
      parsed.search = queryString ? `?${queryString}` : '';

      // Normalize pathname: remove trailing slash if not root
      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      parsed.pathname = pathname;

      return parsed.toString();
    } catch {
      // If URL parsing fails, return trimmed raw URL without query/hash
      return rawUrl.split('#')[0].split('?')[0].trim();
    }
  }
}
