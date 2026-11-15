describe('Analytics & Engagement Tracking', () => {
  interface RecipientAnalyticsState {
    delivered: boolean;
    opened: boolean;
    openCount: number;
    clicked: boolean;
    clickCount: number;
    clickedUrls: Set<string>;
    bounced: boolean;
  }

  class AnalyticsAggregator {
    private recipients: Map<string, RecipientAnalyticsState> = new Map();

    public recordDelivered(token: string): void {
      const state = this.getOrCreate(token);
      state.delivered = true;
    }

    public recordOpen(token: string): boolean {
      const state = this.recipients.get(token);
      if (!state) return false;

      const isFirst = !state.opened;
      state.opened = true;
      state.openCount++;
      return isFirst;
    }

    public recordClick(token: string, url: string): boolean {
      const state = this.recipients.get(token);
      if (!state) return false;

      // Clicking also implies the email was opened
      if (!state.opened) {
        state.opened = true;
        state.openCount++;
      }

      const isFirst = !state.clicked;
      state.clicked = true;
      state.clickCount++;
      state.clickedUrls.add(url);
      return isFirst;
    }

    public recordBounce(token: string): void {
      const state = this.getOrCreate(token);
      state.bounced = true;
      state.delivered = false;
    }

    public computeMetrics() {
      const all = Array.from(this.recipients.values());
      const totalRecipients = all.length;
      const deliveredCount = all.filter(r => r.delivered).length;
      const uniqueOpens = all.filter(r => r.opened).length;
      const totalOpens = all.reduce((acc, r) => acc + r.openCount, 0);
      const uniqueClicks = all.filter(r => r.clicked).length;
      const totalClicks = all.reduce((acc, r) => acc + r.clickCount, 0);
      const bouncedCount = all.filter(r => r.bounced).length;

      const openRate = deliveredCount > 0 ? (uniqueOpens / deliveredCount) * 100 : 0;
      const clickThroughRate = deliveredCount > 0 ? (uniqueClicks / deliveredCount) * 100 : 0;
      const clickToOpenRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;

      return {
        totalRecipients,
        deliveredCount,
        bouncedCount,
        uniqueOpens,
        totalOpens,
        openRate: Math.round(openRate * 10) / 10,
        uniqueClicks,
        totalClicks,
        clickThroughRate: Math.round(clickThroughRate * 10) / 10,
        clickToOpenRate: Math.round(clickToOpenRate * 10) / 10,
      };
    }

    private getOrCreate(token: string): RecipientAnalyticsState {
      let state = this.recipients.get(token);
      if (!state) {
        state = {
          delivered: false,
          opened: false,
          openCount: 0,
          clicked: false,
          clickCount: 0,
          clickedUrls: new Set(),
          bounced: false,
        };
        this.recipients.set(token, state);
      }
      return state;
    }
  }

  let aggregator: AnalyticsAggregator;

  beforeEach(() => {
    aggregator = new AnalyticsAggregator();
  });

  it('records delivery, opens, clicks, and computes rates correctly', () => {
    // 4 recipients delivered, 1 bounced
    for (let i = 1; i <= 4; i++) {
      aggregator.recordDelivered(`token-${i}`);
    }
    aggregator.recordBounce('token-5');

    // 2 opened
    aggregator.recordOpen('token-1');
    aggregator.recordOpen('token-1'); // duplicate open
    aggregator.recordOpen('token-2');

    // 1 clicked
    aggregator.recordClick('token-1', 'https://pixlo.local/link1');
    aggregator.recordClick('token-1', 'https://pixlo.local/link2');

    const metrics = aggregator.computeMetrics();

    expect(metrics.totalRecipients).toBe(5);
    expect(metrics.deliveredCount).toBe(4);
    expect(metrics.bouncedCount).toBe(1);
    expect(metrics.uniqueOpens).toBe(2);
    expect(metrics.totalOpens).toBe(3);
    expect(metrics.openRate).toBe(50); // 2 / 4 = 50%
    expect(metrics.uniqueClicks).toBe(1);
    expect(metrics.totalClicks).toBe(2);
    expect(metrics.clickThroughRate).toBe(25); // 1 / 4 = 25%
    expect(metrics.clickToOpenRate).toBe(50); // 1 / 2 = 50%
  });

  it('automatically registers open when click occurs without prior tracking pixel', () => {
    aggregator.recordDelivered('token-ghost');
    aggregator.recordClick('token-ghost', 'https://pixlo.local/deep-link');

    const metrics = aggregator.computeMetrics();
    expect(metrics.uniqueOpens).toBe(1);
    expect(metrics.uniqueClicks).toBe(1);
  });
});
