import { SchemaValidator, SchemaDefinition } from '../src/core/schema-validator';

describe('SchemaValidator Engine', () => {
  const articleSchema: SchemaDefinition = {
    name: 'Article',
    singularName: 'article',
    pluralName: 'articles',
    fields: [
      { name: 'title', type: 'string', required: true, min: 3, max: 100 },
      { name: 'content', type: 'richtext', required: true },
      { name: 'views', type: 'number', min: 0, defaultValue: 0 },
      { name: 'published', type: 'boolean', defaultValue: false },
      { name: 'status', type: 'enumeration', enumValues: ['draft', 'review', 'published'], defaultValue: 'draft' },
      { name: 'slug', type: 'string', regex: '^[a-z0-9-]+$' },
    ],
  };

  it('should validate schema definition structure', () => {
    const res = SchemaValidator.validateSchemaDefinition(articleSchema);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('should reject invalid schema definition without fields', () => {
    const invalidSchema: any = { name: 'Empty', singularName: 'empty', pluralName: 'empties', fields: [] };
    const res = SchemaValidator.validateSchemaDefinition(invalidSchema);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('at least one field');
  });

  it('should pass valid content entries and apply default values', () => {
    const entry = {
      title: 'First Dynamic Post',
      content: '<p>Hello world</p>',
      slug: 'first-dynamic-post',
    };

    const res = SchemaValidator.validateContentEntry(articleSchema, entry);
    expect(res.isValid).toBe(true);
    expect(res.sanitizedData.views).toBe(0);
    expect(res.sanitizedData.published).toBe(false);
    expect(res.sanitizedData.status).toBe('draft');
  });

  it('should fail when required fields are missing', () => {
    const entry = {
      views: 5,
    };

    const res = SchemaValidator.validateContentEntry(articleSchema, entry);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.field === 'title')).toBe(true);
    expect(res.errors.some((e) => e.field === 'content')).toBe(true);
  });

  it('should enforce min/max constraints and regex formatting', () => {
    const entry = {
      title: 'A', // min 3 chars
      content: 'Valid content',
      slug: 'INVALID SLUG WITH SPACES', // regex failure
    };

    const res = SchemaValidator.validateContentEntry(articleSchema, entry);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.field === 'title' && e.message.includes('at least 3'))).toBe(true);
    expect(res.errors.some((e) => e.field === 'slug' && e.message.includes('pattern'))).toBe(true);
  });

  it('should reject values not in enumeration list', () => {
    const entry = {
      title: 'Valid Title',
      content: 'Valid content',
      status: 'archived', // not in ['draft', 'review', 'published']
    };

    const res = SchemaValidator.validateContentEntry(articleSchema, entry);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.field === 'status' && e.message.includes('one of'))).toBe(true);
  });
});
