import { ConflictResolver } from '../sync/conflict-resolver';
import { SyncQueueManager } from '../sync/sync-queue';
import { WebClipperService } from '../sync/web-clipper';
import { MarkdownExporter } from '../sync/markdown-exporter';

describe('E2E Note-Taking App Concurrency & Sync Engine Pipeline', () => {
  it('1. Optimistic Concurrency Engine correctly identifies base revision diverge and merges clean non-overlapping edits', () => {
    const baseContent = 'Title: System Design\nPoint 1: High Availability\nPoint 2: Fault Tolerance';
    const localContent = 'Title: System Design\nPoint 1: High Availability (99.999% SLA)\nPoint 2: Fault Tolerance';
    const remoteContent = 'Title: System Design\nPoint 1: High Availability\nPoint 2: Fault Tolerance (Multi-region replication)';

    const merge = ConflictResolver.threeWayMerge(baseContent, localContent, remoteContent, 'System Design');
    expect(merge.hasConflict).toBe(false);
    expect(merge.conflictCopyRequired).toBe(false);
    expect(merge.mergedText).toContain('(99.999% SLA)');
    expect(merge.mergedText).toContain('(Multi-region replication)');
  });

  it('2. Overlapping concurrent writes produce an explicit conflict copy without losing user data', () => {
    const base = 'Database: PostgreSQL single node';
    const deviceA = 'Database: CockroachDB distributed cluster';
    const deviceB = 'Database: ScyllaDB wide-column store';

    const merge = ConflictResolver.threeWayMerge(base, deviceA, deviceB, 'DB Selection');
    expect(merge.hasConflict).toBe(true);
    expect(merge.conflictCopyRequired).toBe(true);
    expect(merge.conflictCopyTitle).toContain('[Conflict Copy]');
    expect(merge.conflictCopyContent).toBe(deviceA);
    expect(merge.mergedText).toBe(deviceB);
  });

  it('3. Sync Queue maintains strict FIFO ordering and enforces operation idempotency', () => {
    const queue = new SyncQueueManager();

    const enqueued1 = queue.enqueue({
      clientOpId: 'op-alpha-001',
      noteId: 'note-01',
      operation: 'CREATE',
      baseRevision: 0,
      payload: { title: 'First note' },
    });
    expect(enqueued1).toBe(true);

    const duplicateEnqueued = queue.enqueue({
      clientOpId: 'op-alpha-001',
      noteId: 'note-01',
      operation: 'CREATE',
      baseRevision: 0,
      payload: { title: 'First note replay' },
    });
    expect(duplicateEnqueued).toBe(false);

    expect(queue.getQueueLength()).toBe(1);
    const item = queue.peek();
    expect(item?.clientOpId).toBe('op-alpha-001');

    queue.markInFlight('op-alpha-001');
    queue.complete('op-alpha-001');
    expect(queue.getQueueLength()).toBe(0);
  });

  it('4. SSRF Defense blocks internal private network addresses from Web Clipper', async () => {
    expect(await WebClipperService.validateUrl('http://127.0.0.1:4004')).toBe(false);
    expect(await WebClipperService.validateUrl('http://169.254.169.254/latest')).toBe(false);
    expect(await WebClipperService.validateUrl('http://192.168.0.1')).toBe(false);
    expect(await WebClipperService.validateUrl('http://10.0.0.1')).toBe(false);
  });

  it('5. Export formatting produces standard portable Markdown with YAML metadata frontmatter', () => {
    const md = MarkdownExporter.exportToMarkdown({
      title: 'Sprint Retrospective',
      notebookName: 'Engineering',
      tags: ['retro', 'sprint-42'],
      serverRevision: 7,
      createdAt: new Date('2026-11-16T08:00:00Z'),
      updatedAt: new Date('2026-11-16T09:30:00Z'),
      content: '# What went well\n- Velocity was high.\n\n# What can be improved\n- CI build caching.',
    });

    expect(md).toContain('title: "Sprint Retrospective"');
    expect(md).toContain('notebook: "Engineering"');
    expect(md).toContain('revision: 7');
    expect(md).toContain('# What went well');
  });
});
