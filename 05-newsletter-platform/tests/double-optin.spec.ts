describe('Double Opt-in Engine', () => {
  interface PendingSubscriber {
    id: string;
    email: string;
    status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'UNSUBSCRIBED';
    confirmationToken: string;
    tokenExpiresAt: Date;
    confirmedAt?: Date;
  }

  class DoubleOptInService {
    private subscribers: Map<string, PendingSubscriber> = new Map();

    public register(email: string): PendingSubscriber {
      const token = `optin_${Math.random().toString(36).substring(2, 12)}`;
      const sub: PendingSubscriber = {
        id: `sub_${Date.now()}`,
        email: email.toLowerCase(),
        status: 'PENDING_CONFIRMATION',
        confirmationToken: token,
        tokenExpiresAt: new Date(Date.now() + 48 * 3600 * 1000), // 48 hours validity
      };
      this.subscribers.set(token, sub);
      return sub;
    }

    public confirm(token: string): { success: boolean; error?: string; subscriber?: PendingSubscriber } {
      const sub = this.subscribers.get(token);
      if (!sub) {
        return { success: false, error: 'Invalid or unknown confirmation token' };
      }

      if (new Date() > sub.tokenExpiresAt) {
        return { success: false, error: 'Confirmation token has expired' };
      }

      if (sub.status === 'CONFIRMED') {
        return { success: true, subscriber: sub }; // idempotent
      }

      sub.status = 'CONFIRMED';
      sub.confirmedAt = new Date();
      return { success: true, subscriber: sub };
    }
  }

  let optInService: DoubleOptInService;

  beforeEach(() => {
    optInService = new DoubleOptInService();
  });

  it('generates pending status and confirmation token upon registration', () => {
    const sub = optInService.register('reader@domain.com');

    expect(sub.email).toBe('reader@domain.com');
    expect(sub.status).toBe('PENDING_CONFIRMATION');
    expect(sub.confirmationToken).toBeDefined();
    expect(sub.tokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('successfully confirms subscription with valid token', () => {
    const sub = optInService.register('valid@domain.com');
    const result = optInService.confirm(sub.confirmationToken);

    expect(result.success).toBe(true);
    expect(result.subscriber?.status).toBe('CONFIRMED');
    expect(result.subscriber?.confirmedAt).toBeDefined();
  });

  it('rejects confirmation with unknown token', () => {
    const result = optInService.confirm('non-existent-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid or unknown');
  });

  it('rejects expired confirmation token', () => {
    const sub = optInService.register('expired@domain.com');
    sub.tokenExpiresAt = new Date(Date.now() - 10000); // 10s in past

    const result = optInService.confirm(sub.confirmationToken);

    expect(result.success).toBe(false);
    expect(result.error).toContain('has expired');
  });
});
