import { Router, Request, Response } from 'express';
import { PluginSandbox } from '../core/plugin-sandbox';

export const pluginRouter = (sandbox: PluginSandbox): Router => {
  const router = Router();

  // GET /api/v1/plugins - List plugins
  router.get('/', (_req: Request, res: Response) => {
    const list = sandbox.listPlugins().map((p) => ({
      name: p.name,
      slug: p.slug,
      version: p.version,
      isEnabled: p.isEnabled,
      activeHooks: Object.keys(p.hooks),
    }));
    res.json({ data: list });
  });

  // POST /api/v1/plugins/:slug/toggle - Enable/disable plugin
  router.post('/:slug/toggle', (req: Request, res: Response) => {
    const plugin = sandbox.getPlugin(req.params.slug);
    if (!plugin) {
      return res.status(404).json({ error: 'Not Found', message: `Plugin "${req.params.slug}" not found.` });
    }

    plugin.isEnabled = !plugin.isEnabled;
    res.json({
      message: `Plugin "${plugin.slug}" is now ${plugin.isEnabled ? 'enabled' : 'disabled'}.`,
      isEnabled: plugin.isEnabled,
    });
  });

  return router;
};
