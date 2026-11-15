export interface DispatchJobInput {
  campaignId: string;
  publicationId: string;
  listId?: string;
  batchSize?: number;
}

export interface PreparedRecipient {
  subscriberId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  trackingToken: string;
}

export interface DispatchPreparationResult {
  campaignId: string;
  totalEligible: number;
  totalSuppressed: number;
  batches: PreparedRecipient[][];
}

export class CampaignDispatcher {
  /**
   * Partitions eligible recipients into batches, filtering out suppressed entries.
   */
  public prepareRecipients(
    subscribers: Array<{ id: string; email: string; firstName?: string | null; lastName?: string | null; status: string }>,
    suppressedEmails: Set<string>,
    batchSize: number = 100
  ): { eligible: PreparedRecipient[]; suppressedCount: number; batches: PreparedRecipient[][] } {
    const eligible: PreparedRecipient[] = [];
    let suppressedCount = 0;

    for (const sub of subscribers) {
      if (sub.status !== 'CONFIRMED') {
        continue;
      }

      if (suppressedEmails.has(sub.email.toLowerCase())) {
        suppressedCount++;
        continue;
      }

      const trackingToken = `trk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      eligible.push({
        subscriberId: sub.id,
        email: sub.email,
        firstName: sub.firstName,
        lastName: sub.lastName,
        trackingToken,
      });
    }

    const batches: PreparedRecipient[][] = [];
    for (let i = 0; i < eligible.length; i += batchSize) {
      batches.push(eligible.slice(i, i + batchSize));
    }

    return {
      eligible,
      suppressedCount,
      batches,
    };
  }

  /**
   * Verifies campaign state transition.
   */
  public canTransition(currentStatus: string, nextStatus: string): boolean {
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ['SCHEDULED', 'QUEUED', 'CANCELLED'],
      SCHEDULED: ['QUEUED', 'DRAFT', 'CANCELLED'],
      QUEUED: ['SENDING', 'CANCELLED'],
      SENDING: ['SENT', 'FAILED', 'CANCELLED'],
      SENT: [],
      CANCELLED: ['DRAFT'],
      FAILED: ['DRAFT', 'QUEUED'],
    };

    return (allowedTransitions[currentStatus] || []).includes(nextStatus);
  }
}
