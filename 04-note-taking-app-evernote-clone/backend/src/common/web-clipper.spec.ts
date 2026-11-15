import { WebClipperService } from '../../../sync/web-clipper';

describe('WebClipperService - SSRF Defense & Sanitization', () => {
  it('should block loopback and private IPv4 addresses', async () => {
    expect(WebClipperService.isIpBlocked('127.0.0.1')).toBe(true);
    expect(WebClipperService.isIpBlocked('10.1.2.3')).toBe(true);
    expect(WebClipperService.isIpBlocked('192.168.1.1')).toBe(true);
    expect(WebClipperService.isIpBlocked('172.16.5.9')).toBe(true);
    expect(WebClipperService.isIpBlocked('169.254.169.254')).toBe(true);
    expect(WebClipperService.isIpBlocked('::1')).toBe(true);
  });

  it('should reject local and internal URLs in validateUrl', async () => {
    const res1 = await WebClipperService.validateUrl('http://localhost:4004/api');
    expect(res1).toBe(false);

    const res2 = await WebClipperService.validateUrl('http://127.0.0.1:8080');
    expect(res2).toBe(false);

    const res3 = await WebClipperService.validateUrl('file:///etc/passwd');
    expect(res3).toBe(false);
  });

  it('should strip scripts, iframes, styles, and inline events from clipped HTML', () => {
    const raw = `
      <article>
        <h1>Breaking Research</h1>
        <p>Main text content.</p>
        <script>window.location='https://attacker.com';</script>
        <iframe src="https://malicious.com"></iframe>
        <button onclick="stealTokens()">Click</button>
      </article>
    `;
    const clean = WebClipperService.sanitizeHtml(raw);
    expect(clean).toContain('Main text content.');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('<iframe');
    expect(clean).not.toContain('onclick');
  });

  it('should format clipped note with clean source link attribution', () => {
    const formatted = WebClipperService.formatClippedNote(
      'Rust 2026 Roadmap',
      'https://example.com/rust-roadmap',
      '<p>Compiler performance optimizations.</p>',
    );
    expect(formatted).toContain('# Rust 2026 Roadmap');
    expect(formatted).toContain('Clipped from: [https://example.com/rust-roadmap](https://example.com/rust-roadmap)');
    expect(formatted).toContain('<p>Compiler performance optimizations.</p>');
  });
});
