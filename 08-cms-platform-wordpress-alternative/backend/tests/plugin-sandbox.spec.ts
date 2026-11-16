import { PluginSandbox, createSeoPlugin, createWebhookPlugin } from '../src/core/plugin-sandbox';

describe('PluginSandbox Lifecycle', () => {
  it('should register and list plugins', () => {
    const sandbox = new PluginSandbox();
    const seo = createSeoPlugin();
    sandbox.registerPlugin(seo);

    expect(sandbox.listPlugins().length).toBe(1);
    expect(sandbox.getPlugin('seo-engine')?.name).toBe('SEO & Reading Time Engine');
  });

  it('should auto-generate slug and reading time via SEO plugin beforeCreate hook', async () => {
    const sandbox = new PluginSandbox();
    sandbox.registerPlugin(createSeoPlugin());

    const inputData = {
      title: 'Top 10 Architectural Patterns in 2026',
      content: 'Distributed architectures require careful data boundary isolation. '.repeat(50), // 350 words
    };

    const transformed = await sandbox.dispatchHook('beforeCreate', {
      contentType: 'articles',
      action: 'beforeCreate',
      data: inputData,
    });

    expect(transformed.slug).toBe('top-10-architectural-patterns-in-2026');
    expect(transformed.readingTimeMinutes).toBe(2); // 350 words / 200 = ceil(1.75) = 2
  });

  it('should trigger webhook callback on afterCreate hook', async () => {
    const sandbox = new PluginSandbox();
    const webhookCalls: any[] = [];

    const webhookPlugin = createWebhookPlugin((event, ctx) => {
      webhookCalls.push({ event, ctx });
    });
    sandbox.registerPlugin(webhookPlugin);

    await sandbox.dispatchHook('afterCreate', {
      contentType: 'products',
      action: 'afterCreate',
      data: { id: 'p-1', name: 'Smartwatch' },
    });

    expect(webhookCalls.length).toBe(1);
    expect(webhookCalls[0].event).toBe('afterCreate');
    expect(webhookCalls[0].ctx.contentType).toBe('products');
  });
});
