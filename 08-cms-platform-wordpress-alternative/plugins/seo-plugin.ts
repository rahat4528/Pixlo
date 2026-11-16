/**
 * Standalone SEO Metadata Plugin for Pixlo CMS Platform
 * Auto-generates URL slugs from title fields and calculates estimated reading time.
 */

export interface SeoPluginContext {
  contentType: string;
  action: string;
  data: Record<string, any>;
}

export const seoPlugin = {
  name: 'SEO & Reading Time Engine',
  slug: 'seo-engine',
  version: '1.0.0',
  isEnabled: true,
  beforeCreate: (ctx: SeoPluginContext) => {
    const data = { ...ctx.data };
    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
    }
    if (data.content && typeof data.content === 'string') {
      const words = data.content.trim().split(/\s+/).length;
      data.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    }
    return data;
  },
  beforeUpdate: (ctx: SeoPluginContext) => {
    const data = { ...ctx.data };
    if (data.content && typeof data.content === 'string') {
      const words = data.content.trim().split(/\s+/).length;
      data.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    }
    return data;
  },
};
