import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export interface MediaUploadOptions {
  uploadDir: string;
  maxSizeBytes?: number;
}

export interface MediaVariant {
  name: string;
  width: number;
  height: number;
  url: string;
}

export interface MediaItem {
  id: string;
  fileName: string;
  fileHash: string;
  mimeType: string;
  fileSize: number;
  url: string;
  formats: Record<string, MediaVariant>;
  altText?: string;
  createdAt: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export class MediaManager {
  private uploadDir: string;
  private maxSizeBytes: number;

  constructor(options: MediaUploadOptions) {
    this.uploadDir = path.resolve(options.uploadDir);
    this.maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file buffer after security validations
   */
  async processUpload(
    fileName: string,
    mimeType: string,
    buffer: Buffer,
    altText?: string
  ): Promise<MediaItem> {
    // 1. MIME Validation
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(`Unsupported MIME type: "${mimeType}". Allowed types: JPEG, PNG, WebP, GIF, SVG, PDF.`);
    }

    // 2. Size Validation
    if (buffer.length > this.maxSizeBytes) {
      throw new Error(
        `File size (${(buffer.length / 1024 / 1024).toFixed(1)}MB) exceeds limit of ${(
          this.maxSizeBytes /
          1024 /
          1024
        ).toFixed(1)}MB.`
      );
    }

    // 3. Path Traversal Guard
    const sanitizedBase = path.basename(fileName);
    if (sanitizedBase !== fileName || fileName.includes('..')) {
      throw new Error('Invalid file name detected (path traversal attempt).');
    }

    // 4. SHA-256 Checksum
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(fileName) || '.bin';
    const storageFileName = `${fileHash}${ext}`;
    const destinationPath = path.join(this.uploadDir, storageFileName);

    // Write file
    fs.writeFileSync(destinationPath, buffer);

    const relativeUrl = `/media/uploads/${storageFileName}`;

    // Generate responsive variant metadata for images
    const formats: Record<string, MediaVariant> = {};
    if (mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
      formats.thumbnail = {
        name: 'thumbnail',
        width: 150,
        height: 150,
        url: `/media/uploads/${fileHash}-thumb${ext}`,
      };
      formats.medium = {
        name: 'medium',
        width: 600,
        height: 600,
        url: `/media/uploads/${fileHash}-medium${ext}`,
      };
      formats.large = {
        name: 'large',
        width: 1200,
        height: 1200,
        url: `/media/uploads/${fileHash}-large${ext}`,
      };
    }

    const item: MediaItem = {
      id: crypto.randomUUID(),
      fileName: sanitizedBase,
      fileHash,
      mimeType,
      fileSize: buffer.length,
      url: relativeUrl,
      formats,
      altText,
      createdAt: new Date().toISOString(),
    };

    return item;
  }
}
