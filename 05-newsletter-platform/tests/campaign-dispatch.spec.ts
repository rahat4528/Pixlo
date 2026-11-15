import { CampaignDispatcher } from '../workers/campaign-dispatcher';
import { BatchSenderWorker } from '../workers/batch-sender.worker';
import { MockEmailAdapter } from '../email/adapters/mock-email-adapter';

describe('Campaign Dispatch & Delivery Flow', () => {
  let dispatcher: CampaignDispatcher;
  let mockAdapter: MockEmailAdapter;
  let worker: BatchSenderWorker;

  beforeEach(() => {
    dispatcher = new CampaignDispatcher();
    mockAdapter = new MockEmailAdapter();
    worker = new BatchSenderWorker(mockAdapter, {
      rateLimitPerSec: 0, // No delay in unit tests
      baseUrl: 'https://test-newsletter.local',
    });
  });

  it('filters only CONFIRMED subscribers and excludes suppressed addresses', () => {
    const subscribers = [
      { id: '1', email: 'confirmed1@test.local', status: 'CONFIRMED' },
      { id: '2', email: 'pending@test.local', status: 'PENDING_CONFIRMATION' },
      { id: '3', email: 'suppressed@test.local', status: 'CONFIRMED' },
      { id: '4', email: 'unsub@test.local', status: 'UNSUBSCRIBED' },
      { id: '5', email: 'confirmed2@test.local', status: 'CONFIRMED' },
    ];

    const suppressed = new Set(['suppressed@test.local']);

    const prepared = dispatcher.prepareRecipients(subscribers, suppressed, 2);

    expect(prepared.eligible.length).toBe(2);
    expect(prepared.eligible.map(r => r.email)).toEqual(['confirmed1@test.local', 'confirmed2@test.local']);
    expect(prepared.suppressedCount).toBe(1);
    expect(prepared.batches.length).toBe(1);
  });

  it('enforces campaign lifecycle state transitions', () => {
    expect(dispatcher.canTransition('DRAFT', 'SCHEDULED')).toBe(true);
    expect(dispatcher.canTransition('DRAFT', 'QUEUED')).toBe(true);
    expect(dispatcher.canTransition('QUEUED', 'SENDING')).toBe(true);
    expect(dispatcher.canTransition('SENDING', 'SENT')).toBe(true);
    expect(dispatcher.canTransition('SENT', 'QUEUED')).toBe(false);
    expect(dispatcher.canTransition('CANCELLED', 'SENDING')).toBe(false);
  });

  it('executes batch sending through delivery adapter and captures sent messages', async () => {
    const recipients = [
      { subscriberId: 's1', email: 'user1@test.local', firstName: 'User', lastName: 'One', trackingToken: 't1' },
      { subscriberId: 's2', email: 'user2@test.local', firstName: 'User', lastName: 'Two', trackingToken: 't2' },
    ];

    const campaign = {
      id: 'cmp-100',
      subject: 'Weekly Digest',
      htmlBody: '<p>Hello {{subscriber.firstName}}!</p>',
    };

    const publication = {
      id: 'pub-100',
      name: 'Tech Chronicle',
      senderName: 'Chronicle Team',
      senderEmail: 'editor@chronicle.local',
    };

    const result = await worker.processBatch(recipients, campaign, publication);

    expect(result.totalAttempted).toBe(2);
    expect(result.totalSucceeded).toBe(2);
    expect(result.totalFailed).toBe(0);

    const captured = mockAdapter.getSentMessages();
    expect(captured.length).toBe(2);
    expect(captured[0].to.email).toBe('user1@test.local');
    expect(captured[0].subject).toBe('Weekly Digest');
    expect(captured[0].html).toContain('Hello User!');
  });

  it('handles simulated delivery failure gracefully', async () => {
    mockAdapter.simulateFailureFor('bounce@test.local');

    const recipients = [
      { subscriberId: 's1', email: 'ok@test.local', trackingToken: 't1' },
      { subscriberId: 's2', email: 'bounce@test.local', trackingToken: 't2' },
    ];

    const campaign = {
      id: 'cmp-101',
      subject: 'Notice',
      htmlBody: '<p>Content</p>',
    };

    const publication = {
      id: 'pub-100',
      name: 'Tech Chronicle',
      senderName: 'Chronicle Team',
      senderEmail: 'editor@chronicle.local',
    };

    const result = await worker.processBatch(recipients, campaign, publication);

    expect(result.totalAttempted).toBe(2);
    expect(result.totalSucceeded).toBe(1);
    expect(result.totalFailed).toBe(1);
    expect(result.results.find(r => r.email === 'bounce@test.local')?.success).toBe(false);
  });
});
