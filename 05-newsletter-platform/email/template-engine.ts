export interface SubscriberContext {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface PublicationContext {
  id: string;
  name: string;
  url?: string | null;
  senderName: string;
  senderEmail: string;
}

export interface CampaignContext {
  id: string;
  subject: string;
  previewText?: string | null;
}

export interface RenderOptions {
  subscriber: SubscriberContext;
  publication: PublicationContext;
  campaign: CampaignContext;
  unsubscribeUrl: string;
  trackingPixelUrl?: string;
  clickTrackingBaseUrl?: string;
  trackingToken?: string;
}

export interface RenderResult {
  html: string;
  plainText: string;
  subject: string;
  headers: Record<string, string>;
}

export class EmailTemplateEngine {
  /**
   * Replaces merge tags with subscriber and campaign context.
   */
  public replaceMergeTags(content: string, options: RenderOptions): string {
    const fullName = [options.subscriber.firstName, options.subscriber.lastName]
      .filter(Boolean)
      .join(' ') || 'Subscriber';

    const replacements: Record<string, string> = {
      '{{subscriber.name}}': fullName,
      '{{subscriber.firstName}}': options.subscriber.firstName || 'Reader',
      '{{subscriber.lastName}}': options.subscriber.lastName || '',
      '{{subscriber.email}}': options.subscriber.email,
      '{{publication.name}}': options.publication.name,
      '{{publication.url}}': options.publication.url || '#',
      '{{campaign.subject}}': options.campaign.subject,
      '{{unsubscribe_url}}': options.unsubscribeUrl,
      '{{preferences_url}}': `${options.unsubscribeUrl}&view=preferences`,
    };

    let result = content;
    for (const [tag, val] of Object.entries(replacements)) {
      result = result.split(tag).join(val);
    }
    return result;
  }

  /**
   * Ensures the email template contains an unsubscribe link.
   * If missing, appends a compliant default footer.
   */
  public ensureUnsubscribeLink(html: string, plainText: string, options: RenderOptions): { html: string; plainText: string } {
    let finalHtml = html;
    let finalPlainText = plainText;

    const hasHtmlUnsub = html.includes(options.unsubscribeUrl) || html.includes('{{unsubscribe_url}}');
    if (!hasHtmlUnsub) {
      const defaultFooter = `
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
          <p>You received this email because you are subscribed to <strong>${this.escapeHtml(options.publication.name)}</strong>.</p>
          <p><a href="${options.unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Click here to unsubscribe</a></p>
        </div>
      `;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${defaultFooter}</body>`);
      } else {
        finalHtml = `${finalHtml}${defaultFooter}`;
      }
    }

    const hasPlainUnsub = plainText.includes(options.unsubscribeUrl) || plainText.includes('{{unsubscribe_url}}');
    if (!hasPlainUnsub) {
      finalPlainText = `${finalPlainText}\n\n---\nTo unsubscribe from ${options.publication.name}, visit:\n${options.unsubscribeUrl}`;
    }

    return { html: finalHtml, plainText: finalPlainText };
  }

  /**
   * Rewrites links to route through click tracking redirector.
   */
  public rewriteLinksForTracking(html: string, clickBaseUrl: string, trackingToken: string): string {
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;

    return html.replace(linkRegex, (match, quote, url) => {
      // Do not rewrite mailto, tel, anchor hashes, or unsubscribe links
      if (
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('#') ||
        url.includes('/unsubscribe') ||
        url.includes('token=')
      ) {
        return match;
      }

      const encodedTarget = encodeURIComponent(url);
      const trackingUrl = `${clickBaseUrl}?token=${trackingToken}&target=${encodedTarget}`;
      return match.replace(`href=${quote}${url}${quote}`, `href=${quote}${trackingUrl}${quote}`);
    });
  }

  /**
   * Injects 1x1 tracking pixel into HTML before </body> or at end.
   */
  public injectTrackingPixel(html: string, pixelUrl: string): string {
    const pixelTag = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;" />`;
    if (html.includes('</body>')) {
      return html.replace('</body>', `${pixelTag}</body>`);
    }
    return `${html}${pixelTag}`;
  }

  /**
   * Generates RFC 8058 compliant List-Unsubscribe headers.
   */
  public generateHeaders(options: RenderOptions): Record<string, string> {
    return {
      'List-Unsubscribe': `<${options.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Entity-Ref-ID': `${options.campaign.id}-${options.subscriber.id}`,
      'Precedence': 'bulk',
    };
  }

  /**
   * Full pipeline render.
   */
  public render(
    templateHtml: string,
    templatePlainText: string | null,
    options: RenderOptions
  ): RenderResult {
    // 1. Process merge tags in subject and body
    const renderedSubject = this.replaceMergeTags(options.campaign.subject, options);
    let renderedHtml = this.replaceMergeTags(templateHtml, options);
    let renderedPlainText = this.replaceMergeTags(templatePlainText || this.htmlToPlainText(templateHtml), options);

    // 2. Ensure unsubscribe link exists
    const guaranteed = this.ensureUnsubscribeLink(renderedHtml, renderedPlainText, options);
    renderedHtml = guaranteed.html;
    renderedPlainText = guaranteed.plainText;

    // 3. Rewrite links for click tracking if configured
    if (options.clickTrackingBaseUrl && options.trackingToken) {
      renderedHtml = this.rewriteLinksForTracking(
        renderedHtml,
        options.clickTrackingBaseUrl,
        options.trackingToken
      );
    }

    // 4. Inject 1x1 tracking pixel if configured
    if (options.trackingPixelUrl) {
      renderedHtml = this.injectTrackingPixel(renderedHtml, options.trackingPixelUrl);
    }

    // 5. Generate RFC headers
    const headers = this.generateHeaders(options);

    return {
      subject: renderedSubject,
      html: renderedHtml,
      plainText: renderedPlainText,
      headers,
    };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private htmlToPlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi, '$3 ($2)')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
}
