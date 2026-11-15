import { EmailTemplateEngine, RenderOptions } from '../email/template-engine';

describe('EmailTemplateEngine', () => {
  let engine: EmailTemplateEngine;

  beforeEach(() => {
    engine = new EmailTemplateEngine();
  });

  const baseOptions: RenderOptions = {
    subscriber: {
      id: 'sub-123',
      email: 'reader@example.com',
      firstName: 'Alice',
      lastName: 'Wong',
    },
    publication: {
      id: 'pub-456',
      name: 'Distributed Systems Weekly',
      senderName: 'Alice Editor',
      senderEmail: 'editor@weekly.local',
      url: 'https://weekly.local',
    },
    campaign: {
      id: 'cmp-789',
      subject: 'Issue #10: Event Sourcing Demystified',
      previewText: 'A deep dive into event sourcing patterns.',
    },
    unsubscribeUrl: 'https://weekly.local/api/subscribers/unsubscribe?token=tok-123',
    trackingPixelUrl: 'https://weekly.local/api/analytics/pixel/trk-123.png',
    clickTrackingBaseUrl: 'https://weekly.local/api/analytics/click',
    trackingToken: 'trk-123',
  };

  it('correctly replaces all merge tags in subject and body', () => {
    const htmlTemplate = `
      <h1>Welcome to {{publication.name}}!</h1>
      <p>Hello {{subscriber.firstName}} ({{subscriber.name}}),</p>
      <p>Your email is {{subscriber.email}}.</p>
      <a href="{{publication.url}}">Visit Site</a>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    `;

    const result = engine.render(htmlTemplate, null, baseOptions);

    expect(result.subject).toBe('Issue #10: Event Sourcing Demystified');
    expect(result.html).toContain('Welcome to Distributed Systems Weekly!');
    expect(result.html).toContain('Hello Alice (Alice Wong),');
    expect(result.html).toContain('Your email is reader@example.com.');
  });

  it('automatically injects a compliant unsubscribe footer if omitted in template', () => {
    const rawHtml = '<p>An announcement without an explicit unsubscribe button.</p>';
    const result = engine.render(rawHtml, null, baseOptions);

    expect(result.html).toContain(baseOptions.unsubscribeUrl);
    expect(result.html).toContain('Click here to unsubscribe');
    expect(result.plainText).toContain(baseOptions.unsubscribeUrl);
  });

  it('generates RFC 8058 compliant List-Unsubscribe headers', () => {
    const result = engine.render('<p>Content</p>', null, baseOptions);

    expect(result.headers['List-Unsubscribe']).toBe(`<${baseOptions.unsubscribeUrl}>`);
    expect(result.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(result.headers['Precedence']).toBe('bulk');
    expect(result.headers['X-Entity-Ref-ID']).toBe('cmp-789-sub-123');
  });

  it('injects 1x1 tracking pixel into HTML', () => {
    const htmlTemplate = '<html><body><p>Hello world</p></body></html>';
    const result = engine.render(htmlTemplate, null, baseOptions);

    expect(result.html).toContain('<img src="https://weekly.local/api/analytics/pixel/trk-123.png"');
    expect(result.html).toContain('width="1" height="1"');
    expect(result.html).toContain('</body>');
  });

  it('rewrites external links for click tracking while preserving unsubscribe links', () => {
    const html = `
      <p>Check out our <a href="https://example.com/deep-dive">article</a>.</p>
      <p>Reach us at <a href="mailto:support@weekly.local">support</a>.</p>
      <p><a href="${baseOptions.unsubscribeUrl}">Unsubscribe</a></p>
    `;

    const rewritten = engine.rewriteLinksForTracking(html, 'https://weekly.local/api/analytics/click', 'trk-123');

    expect(rewritten).toContain('https://weekly.local/api/analytics/click?token=trk-123&target=https%3A%2F%2Fexample.com%2Fdeep-dive');
    expect(rewritten).toContain('href="mailto:support@weekly.local"');
    expect(rewritten).toContain(`href="${baseOptions.unsubscribeUrl}"`);
  });
});
