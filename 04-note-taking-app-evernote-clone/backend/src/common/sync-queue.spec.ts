import { SyncQueueManager } from '../../../sync/sync-queue';

describe('SyncQueueManager - Offline FIFO Queue & Idempotency', () => {
  let queueManager: SyncQueueManager;

  beforeEach(() => {
    queueManager = new SyncQueueManager();
  });

  it('should enqueue items and maintain FIFO processing order', () => {
    queueManager.enqueue({
      clientOpId: 'op-1',
      noteId: 'note-1',
      operation: 'CREATE',
      baseRevision: 0,
      payload: { title: 'First Note' },
    });

    queueManager.enqueue({
      clientOpId: 'op-2',
      noteId: 'note-1',
      operation: 'UPDATE',
      baseRevision: 1,
      payload: { title: 'Updated Note' },
    });

    expect(queueManager.getQueueLength()).toBe(2);
    const first = queueManager.peek();
    expect(first?.clientOpId).toBe('op-1');
  });

  it('should enforce idempotency by ignoring duplicate clientOpId submissions', () => {
    const success1 = queueManager.enqueue({
      clientOpId: 'op-duplicate-check',
      noteId: 'note-100',
      operation: 'UPDATE',
      baseRevision: 1,
      payload: { title: 'Revision 2' },
    });
    expect(success1).toBe(true);

    const success2 = queueManager.enqueue({
      clientOpId: 'op-duplicate-check',
      noteId: 'note-100',
      operation: 'UPDATE',
      baseRevision: 1,
      payload: { title: 'Revision 2 Again' },
    });
    expect(success2).toBe(false);
    expect(queueManager.getQueueLength()).toBe(1);
  });

  it('should handle retries with exponential backoff on failure', () => {
    queueManager.enqueue({
      clientOpId: 'op-retry-test',
      noteId: 'note-200',
      operation: 'UPDATE',
      baseRevision: 2,
      payload: { title: 'Retry test' },
    });

    const retry1 = queueManager.fail('op-retry-test');
    expect(retry1.canRetry).toBe(true);
    expect(retry1.backoffDelayMs).toBe(2000); // 1000 * 2^1

    const retry2 = queueManager.fail('op-retry-test');
    expect(retry2.canRetry).toBe(true);
    expect(retry2.backoffDelayMs).toBe(4000); // 1000 * 2^2
  });
});
