import * as net from 'net';
import * as dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

export interface ClippedWebPage {
  title: string;
  sourceUrl: string;
  sanitizedHtml: string;
  plainText: string;
}

export class WebClipperService {
  private static readonly BLOCKED_IP_PATTERNS = [
    /^127\./,                         // IPv4 loopback
    /^10\./,                          // Private class A
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
    /^192\.168\./,                    // Private class C
    /^169\.254\./,                    // Link-local / metadata
    /^0\.0\.0\.0$/,
    /^::1$/,
  ];

  static isIpBlocked(ip: string): boolean {
    const cleanIp = ip.trim().toLowerCase();
    if (cleanIp === '::1' || cleanIp.startsWith('fe80:')) return true;
    for (const pattern of this.BLOCKED_IP_PATTERNS) {
      if (pattern.test(cleanIp)) return true;
    }
    return false;
  }

  static async validateUrl(rawUrl: string): Promise<boolean> {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
        return false;
      }

      if (net.isIP(hostname)) {
        return !this.isIpBlocked(hostname);
      }

      const lookupResult = await lookupAsync(hostname, { all: true });
      for (const entry of lookupResult) {
        if (this.isIpBlocked(entry.address)) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes web-clipped HTML:
   * Strips scripts, styles, iframes, and inline event handlers
   */
  static sanitizeHtml(rawHtml: string): string {
    if (!rawHtml) return '';

    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:[^"']*/gi, '#')
      .trim();
  }

  /**
   * Creates a structured note representation of a clipped article.
   */
  static formatClippedNote(title: string, sourceUrl: string, cleanHtml: string): string {
    const plain = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return `
# ${title}

*Clipped from: [${sourceUrl}](${sourceUrl}) on ${new Date().toLocaleDateString()}*

---

${cleanHtml}
`.trim();
  }
}
