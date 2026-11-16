import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { memoryStore, ApiToken } from '../store/memory-store';

const router = Router();

// GET /api/v1/tokens - List API tokens
router.get('/', (_req: Request, res: Response) => {
  const tokens = Array.from(memoryStore.tokens.values()).map((t) => ({
    id: t.id,
    name: t.name,
    tokenType: t.tokenType,
    scopes: t.scopes,
    createdAt: t.createdAt,
    expiresAt: t.expiresAt,
  }));
  res.json({ data: tokens });
});

// POST /api/v1/tokens - Create API token
router.post('/', (req: Request, res: Response) => {
  const { name, tokenType = 'READ_ONLY', scopes = ['content:read'] } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Token name is required.' });
  }

  const rawToken = `cms_live_${crypto.randomBytes(24).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const token: ApiToken = {
    id: crypto.randomUUID(),
    name,
    tokenHash,
    tokenType,
    scopes,
    createdAt: new Date().toISOString(),
  };

  memoryStore.tokens.set(token.id, token);

  res.status(201).json({
    message: 'API token generated. Store this secret safely; it will not be shown again.',
    token: rawToken,
    id: token.id,
    name: token.name,
    tokenType: token.tokenType,
    scopes: token.scopes,
  });
});

export default router;
