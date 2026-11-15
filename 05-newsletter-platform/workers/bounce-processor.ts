export interface BounceEvent {
  email: string;
  publicationId: string;
  campaignId?: string;
  recipientToken?: string;
  bounceType: 'hard' | 'soft';
  diagnosticCode?: string;
  timestamp: Date;
}

export interface ComplaintEvent {
  email: string;
  publicationId: string;
  campaignId?: string;
  recipientToken?: string;
  feedbackType?: string;
  timestamp: Date;
}

export interface BounceHandlingAction {
  action: 'SUPPRESS_AND_CLEAN' | 'INCREMENT_SOFT_BOUNCE' | 'IGNORE';
  reason: 'BOUNCE' | 'COMPLAINT';
  email: string;
  detail: string;
}

export class BounceProcessor {
  private softBounceCounts: Map<string, number> = new Map();
  private readonly SOFT_BOUNCE_THRESHOLD = 3;

  /**
   * Process incoming bounce event.
   */
  public handleBounce(bounce: BounceEvent): BounceHandlingAction {
    const emailKey = `${bounce.publicationId}:${bounce.email.toLowerCase()}`;

    if (bounce.bounceType === 'hard') {
      return {
        action: 'SUPPRESS_AND_CLEAN',
        reason: 'BOUNCE',
        email: bounce.email.toLowerCase(),
        detail: bounce.diagnosticCode || 'Permanent hard bounce: mailbox nonexistent or blocked',
      };
    }

    // Soft bounce tracking
    const current = (this.softBounceCounts.get(emailKey) || 0) + 1;
    this.softBounceCounts.set(emailKey, current);

    if (current >= this.SOFT_BOUNCE_THRESHOLD) {
      return {
        action: 'SUPPRESS_AND_CLEAN',
        reason: 'BOUNCE',
        email: bounce.email.toLowerCase(),
        detail: `Repeated soft bounces exceeded threshold (${current} failures)`,
      };
    }

    return {
      action: 'INCREMENT_SOFT_BOUNCE',
      reason: 'BOUNCE',
      email: bounce.email.toLowerCase(),
      detail: `Soft bounce recorded (${current}/${this.SOFT_BOUNCE_THRESHOLD})`,
    };
  }

  /**
   * Process incoming spam complaint event.
   */
  public handleComplaint(complaint: ComplaintEvent): BounceHandlingAction {
    return {
      action: 'SUPPRESS_AND_CLEAN',
      reason: 'COMPLAINT',
      email: complaint.email.toLowerCase(),
      detail: `Recipient submitted spam complaint: ${complaint.feedbackType || 'abuse'}`,
    };
  }

  public getSoftBounceCount(publicationId: string, email: string): number {
    return this.softBounceCounts.get(`${publicationId}:${email.toLowerCase()}`) || 0;
  }
}
