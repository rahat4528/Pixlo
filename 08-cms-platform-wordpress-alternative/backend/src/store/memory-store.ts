import { SchemaDefinition } from '../core/schema-validator';
import { MediaItem } from '../core/media-manager';
import { PluginDefinition } from '../core/plugin-sandbox';

export interface ContentEntry {
  id: string;
  contentType: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  locale: string;
  version: number;
  data: Record<string, any>;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  tokenHash: string;
  tokenType: 'READ_ONLY' | 'FULL_ACCESS' | 'CUSTOM';
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
}

class MemoryStore {
  public schemas: Map<string, SchemaDefinition> = new Map();
  public entries: Map<string, ContentEntry> = new Map();
  public media: Map<string, MediaItem> = new Map();
  public tokens: Map<string, ApiToken> = new Map();

  clear(): void {
    this.schemas.clear();
    this.entries.clear();
    this.media.clear();
    this.tokens.clear();
  }
}

export const memoryStore = new MemoryStore();
