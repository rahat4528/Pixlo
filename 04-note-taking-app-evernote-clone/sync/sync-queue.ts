export type ClientSyncState =
  | 'LOCAL_ONLY'
  | 'PENDING_SYNC'
  | 'SYNCING'
  | 'SYNCED'
  | 'CONFLICT'
  | 'ERROR';

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export interface SyncQueueItem {
  clientOpId: string;
  noteId: string;
  operation: SyncOperationType;
  baseRevision: number;
  payload: {
    title?: string;
    content?: string;
    plainText?: string;
    notebookId?: string;
    isPinned?: boolean;
    isStarred?: boolean;
    isArchived?: boolean;
    isTrashed?: boolean;
    tags?: string[];
  };
  timestamp: number;
  retryCount: number;
  status: 'QUEUED' | 'IN_FLIGHT' | 'COMPLETED' | 'FAILED';
}

export class SyncQueueManager {
  private queue: SyncQueueItem[] = [];
  private processedOpIds: Set<string> = new Set();
  private maxRetries = 5;

  /**
   * Adds an operation to the FIFO offline queue.
   * If an operation with the same clientOpId exists, it is ignored (idempotency).
   */
  enqueue(item: Omit<SyncQueueItem, 'status' | 'retryCount' | 'timestamp'>): boolean {
    if (this.processedOpIds.has(item.clientOpId)) {
      return false; // Already processed
    }

    const existingIndex = this.queue.findIndex((q) => q.clientOpId === item.clientOpId);
    if (existingIndex !== -1) {
      return false; // Already in queue
    }

    this.queue.push({
      ...item,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'QUEUED',
    });

    return true;
  }

  /**
   * Peeks the next item in FIFO order.
   */
  peek(): SyncQueueItem | undefined {
    return this.queue.find((q) => q.status === 'QUEUED');
  }

  /**
   * Marks item as in-flight
   */
  markInFlight(clientOpId: string): void {
    const item = this.queue.find((q) => q.clientOpId === clientOpId);
    if (item) {
      item.status = 'IN_FLIGHT';
    }
  }

  /**
   * Completes an item and records its clientOpId to preserve idempotency
   */
  complete(clientOpId: string): void {
    this.processedOpIds.add(clientOpId);
    this.queue = this.queue.filter((q) => q.clientOpId !== clientOpId);
  }

  /**
   * Handles failure with retry increment. If retries exceed limit, marks as FAILED.
   */
  fail(clientOpId: string): { canRetry: boolean; backoffDelayMs: number } {
    const item = this.queue.find((q) => q.clientOpId === clientOpId);
    if (!item) {
      return { canRetry: false, backoffDelayMs: 0 };
    }

    item.retryCount += 1;
    if (item.retryCount >= this.maxRetries) {
      item.status = 'FAILED';
      return { canRetry: false, backoffDelayMs: 0 };
    }

    item.status = 'QUEUED';
    const delay = Math.min(30000, 1000 * Math.pow(2, item.retryCount));
    return { canRetry: true, backoffDelayMs: delay };
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getAllItems(): SyncQueueItem[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.processedOpIds.clear();
  }
}
