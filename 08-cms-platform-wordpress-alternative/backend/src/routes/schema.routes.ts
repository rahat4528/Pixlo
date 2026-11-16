import { Router, Request, Response } from 'express';
import { SchemaValidator, SchemaDefinition } from '../core/schema-validator';
import { memoryStore } from '../store/memory-store';

const router = Router();

// GET /api/v1/admin/schemas - List schemas
router.get('/', (_req: Request, res: Response) => {
  const schemas = Array.from(memoryStore.schemas.values());
  res.json({
    data: schemas,
    total: schemas.length,
  });
});

// POST /api/v1/admin/schemas - Create dynamic content type schema
router.post('/', (req: Request, res: Response) => {
  const payload = req.body as SchemaDefinition;
  const validation = SchemaValidator.validateSchemaDefinition(payload);

  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid schema definition',
      details: validation.errors,
    });
  }

  const slug = payload.pluralName.toLowerCase();
  if (memoryStore.schemas.has(slug)) {
    return res.status(400).json({
      error: 'Conflict',
      message: `Content type with slug "${slug}" already exists.`,
    });
  }

  memoryStore.schemas.set(slug, payload);

  res.status(201).json({
    message: `Content type "${payload.name}" registered successfully.`,
    slug,
    schema: payload,
  });
});

// GET /api/v1/admin/schemas/:slug - Get single schema
router.get('/:slug', (req: Request, res: Response) => {
  const schema = memoryStore.schemas.get(req.params.slug);
  if (!schema) {
    return res.status(404).json({ error: 'Not Found', message: `Schema "${req.params.slug}" not found.` });
  }
  res.json(schema);
});

// DELETE /api/v1/admin/schemas/:slug - Delete schema
router.delete('/:slug', (req: Request, res: Response) => {
  const deleted = memoryStore.schemas.delete(req.params.slug);
  if (!deleted) {
    return res.status(404).json({ error: 'Not Found', message: `Schema "${req.params.slug}" not found.` });
  }
  res.status(204).send();
});

export default router;
