import fs from 'fs';
import path from 'path';
import os from 'os';
import { MediaManager } from '../src/core/media-manager';

describe('MediaManager Asset Subsystem', () => {
  let tempDir: string;
  let mediaManager: MediaManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cms-media-test-'));
    mediaManager = new MediaManager({
      uploadDir: tempDir,
      maxSizeBytes: 1024 * 1024, // 1MB limit for testing
    });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should process and store valid image with SHA-256 and format variants', async () => {
    const mockImageBuffer = Buffer.from('fake-png-binary-stream-data-payload');
    const result = await mediaManager.processUpload(
      'banner.png',
      'image/png',
      mockImageBuffer,
      'Homepage banner'
    );

    expect(result.fileName).toBe('banner.png');
    expect(result.fileHash).toBeDefined();
    expect(result.fileHash.length).toBe(64); // SHA-256 hex length
    expect(result.mimeType).toBe('image/png');
    expect(result.formats.thumbnail).toBeDefined();
    expect(result.formats.thumbnail.width).toBe(150);
    expect(result.formats.medium.width).toBe(600);
    expect(result.formats.large.width).toBe(1200);

    // Verify file written to disk
    const expectedFilePath = path.join(tempDir, `${result.fileHash}.png`);
    expect(fs.existsSync(expectedFilePath)).toBe(true);
  });

  it('should reject unsupported MIME types', async () => {
    const badBuffer = Buffer.from('executable binary code');
    await expect(
      mediaManager.processUpload('malware.exe', 'application/x-msdownload', badBuffer)
    ).rejects.toThrow('Unsupported MIME type');
  });

  it('should reject files exceeding maximum size limit', async () => {
    const largeBuffer = Buffer.alloc(2 * 1024 * 1024); // 2MB > 1MB limit
    await expect(
      mediaManager.processUpload('huge-photo.jpg', 'image/jpeg', largeBuffer)
    ).rejects.toThrow('exceeds limit');
  });

  it('should block directory traversal file names', async () => {
    const buffer = Buffer.from('test');
    await expect(
      mediaManager.processUpload('../../evil.png', 'image/png', buffer)
    ).rejects.toThrow('path traversal attempt');
  });
});
