import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { SchemaValidator } from '../core/schema-validator';
import { DynamicQueryEngine } from '../core/dynamic-query';
import { PluginSandbox } from '../core/plugin-sandbox';
import { memoryStore, ContentEntry } from '../store/memory-store';

export const contentRouter = (sandbox: PluginSandbox): Router => {
  const router = Router();

  // Helper to fetch schema
  const getSchemaOr404 = (contentType: string, res: Response) => {
    const schema = memoryStore.schemas.get(contentType.toLowerCase());
    if (!schema) {
      res.status(404).json({
        error: 'Not Found',
        message: `Content type "${contentType}" is not registered in the schema builder.`,
      });
      return null;
    }
    return schema;
  };

  // GET /api/v1/content/:contentType - List entries with filtering, sorting, pagination
  router.get('/:contentType', (req: Request, res: Response) => {
    const { contentType } = req.params;
    const schema = getSchemaOr404(contentType, res);
    if (!schema) return;

    const allEntries = Array.from(memoryStore.entries.values()).filter(
      (e) => e.contentType === contentType.toLowerCase()
    );

    // Unpack filters from query parameters
    const query = req.query as Record<string, any>;
    const filters: Record<string, any> = {};

    for (const [key, val] of Object.entries(query)) {
      if (['page', 'pageSize', 'sort', 'fields'].includes(key)) continue;

      // Check for operator syntax: price[$gt]=100
      const opMatch = key.match(/^(.+)\[(\$[a-zA-Z]+)\]$/);
      if (opMatch) {
        const fieldName = opMatch[1];
        const op = opMatch[2];
        if (!filters[fieldName]) filters[fieldName] = {};
        filters[fieldName][op] = isNaN(Number(val)) ? val : Number(val);
      } else {
        filters[key] = isNaN(Number(val)) ? val : Number(val);
      }
    }

    const options = {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: query.sort as string,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 10,
      fields: query.fields ? (query.fields as string).split(',') : undefined,
    };

    // Flatten entry.data with top-level entry fields for querying
    const flatRecords = allEntries.map((e) => ({
      id: e.id,
      status: e.status,
      locale: e.locale,
      version: e.version,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      publishedAt: e.publishedAt,
      ...e.data,
    }));

    const result = DynamicQueryEngine.executeQuery(flatRecords, options);
    res.json(result);
  });

  // GET /api/v1/content/:contentType/:id - Get single entry
  router.get('/:contentType/:id', (req: Request, res: Response) => {
    const { contentType, id } = req.params;
    const schema = getSchemaOr404(contentType, res);
    if (!schema) return;

    const entry = memoryStore.entries.get(id);
    if (!entry || entry.contentType !== contentType.toLowerCase()) {
      return res.status(404).json({ error: 'Not Found', message: `Entry "${id}" not found.` });
    }

    res.json({
      id: entry.id,
      contentType: entry.contentType,
      status: entry.status,
      locale: entry.locale,
      version: entry.version,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      publishedAt: entry.publishedAt,
      ...entry.data,
    });
  });

  // POST /api/v1/content/:contentType - Create new entry
  router.post('/:contentType', async (req: Request, res: Response) => {
    const { contentType } = req.params;
    const schema = getSchemaOr404(contentType, res);
    if (!schema) return;

    const payload = req.body || {};

    // 1. Validate fields against dynamic schema
    const validation = SchemaValidator.validateContentEntry(schema, payload);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.errors,
      });
    }

    // 2. Execute beforeCreate hook
    let processedData = validation.sanitizedData;
    try {
      processedData = await sandbox.dispatchHook('beforeCreate', {
        contentType: contentType.toLowerCase(),
        action: 'beforeCreate',
        data: processedData,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Plugin hook error', message: err.message });
    }

    const entryId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newEntry: ContentEntry = {
      id: entryId,
      contentType: contentType.toLowerCase(),
      status: (payload.status as any) || 'DRAFT',
      locale: payload.locale || 'en',
      version: 1,
      data: processedData,
      createdAt: now,
      updatedAt: now,
      publishedAt: payload.status === 'PUBLISHED' ? now : undefined,
    };

    memoryStore.entries.set(entryId, newEntry);

    // 3. Execute afterCreate hook
    try {
      await sandbox.dispatchHook('afterCreate', {
        contentType: contentType.toLowerCase(),
        action: 'afterCreate',
        entryId,
        data: processedData,
      });
    } catch (err: any) {
      console.warn('afterCreate hook error:', err.message);
    }

    res.status(201).json({
      id: newEntry.id,
      contentType: newEntry.contentType,
      status: newEntry.status,
      locale: newEntry.locale,
      version: newEntry.version,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
      publishedAt: newEntry.publishedAt,
      ...newEntry.data,
    });
  });

  // PUT /api/v1/content/:contentType/:id - Update entry
  router.put('/:contentType/:id', async (req: Request, res: Response) => {
    const { contentType, id } = req.params;
    const schema = getSchemaOr404(contentType, res);
    if (!schema) return;

    const entry = memoryStore.entries.get(id);
    if (!entry || entry.contentType !== contentType.toLowerCase()) {
      return res.status(404).json({ error: 'Not Found', message: `Entry "${id}" not found.` });
    }

    const payload = req.body || {};
    const merged = { ...entry.data, ...payload };

    // Validate merged data
    const validation = SchemaValidator.validateContentEntry(schema, merged);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.errors,
      });
    }

    let processedData = validation.sanitizedData;
    try {
      processedData = await sandbox.dispatchHook('beforeUpdate', {
        contentType: contentType.toLowerCase(),
        action: 'beforeUpdate',
        entryId: id,
        data: processedData,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Plugin hook error', message: err.message });
    }

    entry.data = processedData;
    entry.version += 1;
    entry.updatedAt = new Date().toISOString();

    if (payload.status) {
      entry.status = payload.status;
      if (payload.status === 'PUBLISHED' && !entry.publishedAt) {
        entry.publishedAt = entry.updatedAt;
      }
    }

    try {
      await sandbox.dispatchHook('afterUpdate', {
        contentType: contentType.toLowerCase(),
        action: 'afterUpdate',
        entryId: id,
        data: processedData,
      });
    } catch (err: any) {
      console.warn('afterUpdate hook error:', err.message);
    }

    res.json({
      id: entry.id,
      contentType: entry.contentType,
      status: entry.status,
      locale: entry.locale,
      version: entry.version,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      publishedAt: entry.publishedAt,
      ...entry.data,
    });
  });

  // POST /api/v1/content/:contentType/:id/publish - Publish entry
  router.post('/:contentType/:id/publish', (req: Request, res: Response) => {
    const { contentType, id } = req.params;
    const entry = memoryStore.entries.get(id);
    if (!entry || entry.contentType !== contentType.toLowerCase()) {
      return res.status(404).json({ error: 'Not Found', message: `Entry "${id}" not found.` });
    }

    entry.status = 'PUBLISHED';
    entry.publishedAt = new Date().toISOString();
    entry.updatedAt = entry.publishedAt;

    res.json({
      id: entry.id,
      status: entry.status,
      publishedAt: entry.publishedAt,
      message: `Entry "${id}" published successfully.`,
    });
  });

  // DELETE /api/v1/content/:contentType/:id - Delete entry
  router.delete('/:contentType/:id', async (req: Request, res: Response) => {
    const { contentType, id } = req.params;
    const entry = memoryStore.entries.get(id);
    if (!entry || entry.contentType !== contentType.toLowerCase()) {
      return res.status(404).json({ error: 'Not Found', message: `Entry "${id}" not found.` });
    }

    try {
      await sandbox.dispatchHook('beforeDelete', {
        contentType: contentType.toLowerCase(),
        action: 'beforeDelete',
        entryId: id,
        data: entry.data,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Plugin hook error', message: err.message });
    }

    memoryStore.entries.delete(id);

    try {
      await sandbox.dispatchHook('afterDelete', {
        contentType: contentType.toLowerCase(),
        action: 'afterDelete',
        entryId: id,
        data: entry.data,
      });
    } catch (err: any) {
      console.warn('afterDelete hook error:', err.message);
    }

    res.status(204).send();
  });

  return router;
};
