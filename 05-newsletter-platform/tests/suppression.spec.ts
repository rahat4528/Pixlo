import { BounceProcessor, BounceEvent, ComplaintEvent } from '../workers/bounce-processor';

describe('Suppression & Bounce Processor', () => {
  let processor: BounceProcessor;

  beforeEach(() => {
    processor = new BounceProcessor();
  });

  it('immediately suppresses and cleans subscriber upon hard bounce', () => {
    const event: BounceEvent = {
      email: 'nonexistent@example.com',
      publicationId: 'pub-1',
      bounceType: 'hard',
      diagnosticCode: '550 5.1.1 User unknown',
      timestamp: new Date(),
    };

    const action = processor.handleBounce(event);

    expect(action.action).toBe('SUPPRESS_AND_CLEAN');
    expect(action.reason).toBe('BOUNCE');
    expect(action.email).toBe('nonexistent@example.com');
    expect(action.detail).toContain('550 5.1.1');
  });

  it('increments soft bounce count on temporary delivery failures', () => {
    const event: BounceEvent = {
      email: 'fullmailbox@example.com',
      publicationId: 'pub-1',
      bounceType: 'soft',
      diagnosticCode: '452 Mailbox quota exceeded',
      timestamp: new Date(),
    };

    const action1 = processor.handleBounce(event);
    expect(action1.action).toBe('INCREMENT_SOFT_BOUNCE');
    expect(processor.getSoftBounceCount('pub-1', 'fullmailbox@example.com')).toBe(1);

    const action2 = processor.handleBounce(event);
    expect(action2.action).toBe('INCREMENT_SOFT_BOUNCE');
    expect(processor.getSoftBounceCount('pub-1', 'fullmailbox@example.com')).toBe(2);
  });

  it('escalates to permanent suppression when soft bounces reach threshold of 3', () => {
    const event: BounceEvent = {
      email: 'overflow@example.com',
      publicationId: 'pub-1',
      bounceType: 'soft',
      diagnosticCode: '452 Mailbox quota exceeded',
      timestamp: new Date(),
    };

    processor.handleBounce(event); // 1
    processor.handleBounce(event); // 2
    const action3 = processor.handleBounce(event); // 3

    expect(action3.action).toBe('SUPPRESS_AND_CLEAN');
    expect(action3.reason).toBe('BOUNCE');
    expect(action3.detail).toContain('threshold (3 failures)');
  });

  it('immediately suppresses subscriber on spam complaint', () => {
    const complaint: ComplaintEvent = {
      email: 'unhappy@example.com',
      publicationId: 'pub-1',
      feedbackType: 'abuse',
      timestamp: new Date(),
    };

    const action = processor.handleComplaint(complaint);

    expect(action.action).toBe('SUPPRESS_AND_CLEAN');
    expect(action.reason).toBe('COMPLAINT');
    expect(action.email).toBe('unhappy@example.com');
  });
});
