import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import { PluginSandbox, createSeoPlugin, createWebhookPlugin } from './core/plugin-sandbox';
import { MediaManager } from './core/media-manager';
import schemaRoutes from './routes/schema.routes';
import { contentRouter } from './routes/content.routes';
import { mediaRouter } from './routes/media.routes';
import { pluginRouter } from './routes/plugin.routes';
import tokenRoutes from './routes/token.routes';

export const createApp = (customSandbox?: PluginSandbox, customMediaManager?: MediaManager): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '30mb' }));

  // Initialize Plugin Sandbox & default plugins
  const sandbox = customSandbox || new PluginSandbox();
  if (!customSandbox) {
    sandbox.registerPlugin(createSeoPlugin());
    sandbox.registerPlugin(createWebhookPlugin());
  }

  // Initialize Media Manager
  const uploadDir = path.resolve(__dirname, '../../media/uploads');
  const mediaManager = customMediaManager || new MediaManager({ uploadDir });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: '08-cms-platform-wordpress-alternative',
      port: 4008,
    });
  });

  // Mount API Routers
  app.use('/api/v1/admin/schemas', schemaRoutes);
  app.use('/api/v1/content', contentRouter(sandbox));
  app.use('/api/v1/media', mediaRouter(mediaManager));
  app.use('/api/v1/plugins', pluginRouter(sandbox));
  app.use('/api/v1/tokens', tokenRoutes);

  return app;
};
