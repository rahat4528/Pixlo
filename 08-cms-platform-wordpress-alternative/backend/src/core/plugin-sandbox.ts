export type HookEvent =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete';

export interface HookContext {
  contentType: string;
  action: HookEvent;
  data: Record<string, any>;
  entryId?: string;
  metadata?: Record<string, any>;
}

export type HookHandler = (context: HookContext) => Promise<void | Record<string, any>> | (void | Record<string, any>);

export interface PluginDefinition {
  name: string;
  slug: string;
  version: string;
  isEnabled: boolean;
  hooks: Partial<Record<HookEvent, HookHandler>>;
}

export class PluginSandbox {
  private plugins: Map<string, PluginDefinition> = new Map();

  registerPlugin(plugin: PluginDefinition): void {
    this.plugins.set(plugin.slug, plugin);
  }

  unregisterPlugin(slug: string): boolean {
    return this.plugins.delete(slug);
  }

  getPlugin(slug: string): PluginDefinition | undefined {
    return this.plugins.get(slug);
  }

  listPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Dispatch lifecycle hook across all active plugins in pipeline order
   */
  async dispatchHook(event: HookEvent, context: HookContext): Promise<Record<string, any>> {
    let currentData = { ...context.data };

    for (const plugin of this.plugins.values()) {
      if (!plugin.isEnabled) continue;

      const handler = plugin.hooks[event];
      if (handler) {
        try {
          const res = await handler({
            ...context,
            data: currentData,
          });

          // If handler returned modified data, adopt it
          if (res && typeof res === 'object') {
            currentData = { ...currentData, ...res };
          }
        } catch (err: any) {
          console.error(`Plugin "${plugin.slug}" failed on hook "${event}":`, err.message);
          throw new Error(`Plugin error in ${plugin.slug}: ${err.message}`);
        }
      }
    }

    return currentData;
  }
}

/**
 * Built-in SEO Metadata Plugin
 * Auto-generates slug from title and calculates estimated reading time
 */
export const createSeoPlugin = (): PluginDefinition => ({
  name: 'SEO & Reading Time Engine',
  slug: 'seo-engine',
  version: '1.0.0',
  isEnabled: true,
  hooks: {
    beforeCreate: (ctx) => {
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
    beforeUpdate: (ctx) => {
      const data = { ...ctx.data };
      if (data.content && typeof data.content === 'string') {
        const words = data.content.trim().split(/\s+/).length;
        data.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
      }
      return data;
    },
  },
});

/**
 * Built-in Webhook Dispatcher Plugin
 * Emits audit entries when content changes
 */
export const createWebhookPlugin = (onWebhookDispatch?: (event: HookEvent, ctx: HookContext) => void): PluginDefinition => ({
  name: 'Webhook Dispatcher',
  slug: 'webhook-dispatcher',
  version: '1.0.0',
  isEnabled: true,
  hooks: {
    afterCreate: (ctx) => {
      if (onWebhookDispatch) onWebhookDispatch('afterCreate', ctx);
    },
    afterUpdate: (ctx) => {
      if (onWebhookDispatch) onWebhookDispatch('afterUpdate', ctx);
    },
    afterDelete: (ctx) => {
      if (onWebhookDispatch) onWebhookDispatch('afterDelete', ctx);
    },
  },
});
