import { IngestionWorker } from '../../../workers/ingestion-worker';

describe('IngestionWorker - Failure, Backoff and Suspension Logic', () => {
  it('should calculate exponential backoff delay correctly with increasing retries', () => {
    const delay0 = IngestionWorker.calculateBackoffDelayMs(0); // ~2 min
    const delay1 = IngestionWorker.calculateBackoffDelayMs(1); // ~4 min
    const delay2 = IngestionWorker.calculateBackoffDelayMs(2); // ~8 min
    const delay3 = IngestionWorker.calculateBackoffDelayMs(3); // ~16 min

    expect(delay0).toBeGreaterThanOrEqual(2 * 60 * 1000);
    expect(delay1).toBeGreaterThanOrEqual(4 * 60 * 1000);
    expect(delay2).toBeGreaterThanOrEqual(8 * 60 * 1000);
    expect(delay3).toBeGreaterThanOrEqual(16 * 60 * 1000);
    expect(delay1).toBeGreaterThan(delay0);
    expect(delay2).toBeGreaterThan(delay1);
  });

  it('should enforce suspension threshold constant of 5 failures', () => {
    expect(IngestionWorker.SUSPENSION_THRESHOLD).toBe(5);
  });

  it('should verify backoff is capped to prevent infinite growth', () => {
    const delayHuge = IngestionWorker.calculateBackoffDelayMs(15);
    // 2 * 2^7 = 256 minutes (~4.2 hours) + jitter
    expect(delayHuge).toBeLessThanOrEqual((256 * 60 + 35) * 1000);
  });
});
