import { Router, Request, Response } from 'express';
import { MediaManager } from '../core/media-manager';
import { memoryStore } from '../store/memory-store';

export const mediaRouter = (mediaManager: MediaManager): Router => {
  const router = Router();

  // GET /api/v1/media - List media assets
  router.get('/', (_req: Request, res: Response) => {
    const assets = Array.from(memoryStore.media.values());
    res.json({
      data: assets,
      total: assets.length,
    });
  });

  // POST /api/v1/media/upload - Upload file
  router.post('/upload', async (req: Request, res: Response) => {
    try {
      const { fileName, mimeType, base64Content, altText } = req.body;

      if (!fileName || !mimeType || !base64Content) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'fileName, mimeType, and base64Content are required.',
        });
      }

      const buffer = Buffer.from(base64Content, 'base64');
      const item = await mediaManager.processUpload(fileName, mimeType, buffer, altText);

      memoryStore.media.set(item.id, item);

      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({
        error: 'Upload failed',
        message: err.message,
      });
    }
  });

  // DELETE /api/v1/media/:id - Delete media
  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = memoryStore.media.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: `Media item "${req.params.id}" not found.` });
    }
    res.status(204).send();
  });

  return router;
};
