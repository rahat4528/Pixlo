import { PrismaClient, UserRole, SubscriberStatus, CampaignStatus, RecipientStatus, EmailEventType, SuppressionReason } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pixlo Newsletter Platform database...');

  // 1. Clean existing records
  await prisma.emailEvent.deleteMany();
  await prisma.campaignRecipient.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.subscriberListMembership.deleteMany();
  await prisma.unsubscribeToken.deleteMany();
  await prisma.suppressionEntry.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.subscriberList.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('PixloNewsletter2026!', salt);

  const creator = await prisma.user.create({
    data: {
      email: 'creator@pixlonewsletter.local',
      passwordHash,
      name: 'Sarah Publisher',
      role: UserRole.CREATOR,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@pixlonewsletter.local',
      passwordHash,
      name: 'Platform Administrator',
      role: UserRole.ADMIN,
    },
  });

  // 3. Create Demo Publication
  const publication = await prisma.publication.create({
    data: {
      userId: creator.id,
      name: 'The Weekly Disruption',
      slug: 'weekly-disruption',
      description: 'Independent deep dives on emerging software architectures, distributed systems, and modern engineering practices.',
      logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=160&h=160&fit=crop',
      websiteUrl: 'https://disruption.pixlo.local',
      senderName: 'Sarah from Weekly Disruption',
      senderEmail: 'sarah@disruption.pixlo.local',
      doubleOptIn: true,
      confirmationSubject: 'Please confirm your subscription to The Weekly Disruption',
      confirmationBody: '<p>Click below to verify your email and complete your subscription:</p><p><a href="{{confirmation_url}}">Confirm My Subscription</a></p>',
      welcomeSubject: 'Welcome to The Weekly Disruption!',
      welcomeBody: '<p>Thank you for subscribing! We send out editions every Thursday morning.</p>',
    },
  });

  // 4. Default Subscriber Lists
  const mainList = await prisma.subscriberList.create({
    data: {
      publicationId: publication.id,
      name: 'All Subscribers',
      description: 'Primary subscriber base for regular weekly issues.',
      isDefault: true,
    },
  });

  const vipList = await prisma.subscriberList.create({
    data: {
      publicationId: publication.id,
      name: 'Architecture Enthusiasts',
      description: 'Segment receiving long-form technical tear-downs.',
      isDefault: false,
    },
  });

  // 5. Create Subscribers (Confirmed, Pending, Unsubscribed, Cleaned)
  const subscribersData = [
    { email: 'alex.dev@example.com', firstName: 'Alex', lastName: 'Rivera', status: SubscriberStatus.CONFIRMED, confirmedAt: new Date('2026-01-10T09:00:00Z') },
    { email: 'elena.tech@example.com', firstName: 'Elena', lastName: 'Rostova', status: SubscriberStatus.CONFIRMED, confirmedAt: new Date('2026-01-15T11:20:00Z') },
    { email: 'marcus.eng@example.com', firstName: 'Marcus', lastName: 'Vance', status: SubscriberStatus.CONFIRMED, confirmedAt: new Date('2026-02-01T14:45:00Z') },
    { email: 'chloe.sys@example.com', firstName: 'Chloe', lastName: 'Dupont', status: SubscriberStatus.CONFIRMED, confirmedAt: new Date('2026-02-12T16:10:00Z') },
    { email: 'pending.reader@example.com', firstName: 'Jordan', lastName: 'Lee', status: SubscriberStatus.PENDING_CONFIRMATION, confirmationToken: 'token-pending-12345' },
    { email: 'unsub.reader@example.com', firstName: 'David', lastName: 'Miller', status: SubscriberStatus.UNSUBSCRIBED, confirmedAt: new Date('2026-01-05T08:00:00Z'), unsubscribedAt: new Date('2026-02-01T10:00:00Z'), unsubscribeReason: 'Too frequent' },
    { email: 'bounced.box@example.com', firstName: 'Invalid', lastName: 'Box', status: SubscriberStatus.CLEANED, confirmedAt: new Date('2026-01-01T00:00:00Z') },
  ];

  const createdSubscribers = [];
  for (const s of subscribersData) {
    const subscriber = await prisma.subscriber.create({
      data: {
        publicationId: publication.id,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        status: s.status,
        confirmationToken: s.confirmationToken,
        confirmedAt: s.confirmedAt,
        unsubscribedAt: s.unsubscribedAt,
        unsubscribeReason: s.unsubscribeReason,
      },
    });
    createdSubscribers.push(subscriber);

    // Add confirmed subscribers to default list
    if (s.status === SubscriberStatus.CONFIRMED) {
      await prisma.subscriberListMembership.create({
        data: {
          subscriberId: subscriber.id,
          listId: mainList.id,
        },
      });
    }
  }

  // Add suppression entries for bounced and unsubscribed
  await prisma.suppressionEntry.create({
    data: {
      publicationId: publication.id,
      email: 'bounced.box@example.com',
      reason: SuppressionReason.BOUNCE,
      detail: '550 5.1.1 User unknown / mailbox does not exist',
    },
  });

  await prisma.suppressionEntry.create({
    data: {
      publicationId: publication.id,
      email: 'unsub.reader@example.com',
      reason: SuppressionReason.UNSUBSCRIBE,
      detail: 'User unsubscribed via one-click link',
    },
  });

  // 6. Email Templates
  const standardTemplate = await prisma.emailTemplate.create({
    data: {
      publicationId: publication.id,
      name: 'Standard Editorial Issue',
      subjectDefault: 'The Weekly Disruption: Issue #{{issue_number}}',
      previewText: 'This week: event-driven guarantees, outbox patterns, and high-throughput queues.',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
          <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a;">{{publication.name}}</h1>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Independent Architectural Insights</p>
          </header>
          <main>
            {{content}}
          </main>
          <footer style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>You received this email because you subscribed to {{publication.name}} as {{subscriber.email}}.</p>
            <p><a href="{{unsubscribe_url}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #64748b; text-decoration: underline;">Manage Preferences</a></p>
          </footer>
        </div>
      `,
      plainTextContent: `{{publication.name}}\n\n{{content}}\n\n---\nUnsubscribe: {{unsubscribe_url}}`,
      isDefault: true,
    },
  });

  // 7. Demo Sent Campaign with Recipients and Events
  const campaign = await prisma.campaign.create({
    data: {
      publicationId: publication.id,
      templateId: standardTemplate.id,
      title: 'Issue #42: The Resilient Outbox Pattern in Production',
      subject: 'Issue #42: Eliminating Dual-Write Failures with the Transactional Outbox',
      previewText: 'How modern engineering teams guarantee eventual consistency across microservices.',
      htmlBody: `
        <h2>Eliminating Dual-Write Failures with Transactional Outbox</h2>
        <p>Hello {{subscriber.firstName}},</p>
        <p>In distributed database systems, updating a database and publishing an event to a message broker in a single logical transaction is notoriously unreliable without distributed transactions (2PC).</p>
        <p>The Transactional Outbox pattern resolves this by recording the event as a database row in the same transaction as the business entity changes.</p>
        <p><a href="https://disruption.pixlo.local/articles/outbox-pattern" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 500;">Read Full Analysis Online</a></p>
      `,
      plainTextBody: 'Issue #42: Eliminating Dual-Write Failures with Transactional Outbox. Read full analysis at https://disruption.pixlo.local/articles/outbox-pattern',
      status: CampaignStatus.SENT,
      scheduledFor: new Date('2026-02-15T12:00:00Z'),
      sendStartedAt: new Date('2026-02-15T12:00:05Z'),
      sendCompletedAt: new Date('2026-02-15T12:00:25Z'),
      totalRecipients: 4,
      sentCount: 4,
      openCount: 3,
      clickCount: 2,
      bounceCount: 0,
      unsubscribeCount: 0,
    },
  });

  // Create Campaign Recipients and Tracking Events
  const confirmedSubscribers = createdSubscribers.filter(s => s.status === SubscriberStatus.CONFIRMED);
  for (let i = 0; i < confirmedSubscribers.length; i++) {
    const sub = confirmedSubscribers[i];
    const recipient = await prisma.campaignRecipient.create({
      data: {
        campaignId: campaign.id,
        subscriberId: sub.id,
        status: RecipientStatus.DELIVERED,
        trackingToken: `track-sub-${i + 1}-uuid`,
        sentAt: new Date('2026-02-15T12:00:10Z'),
        deliveredAt: new Date('2026-02-15T12:00:15Z'),
        openedAt: i < 3 ? new Date('2026-02-15T12:15:00Z') : null,
        firstClickedAt: i < 2 ? new Date('2026-02-15T12:20:00Z') : null,
      },
    });

    // Delivered event
    await prisma.emailEvent.create({
      data: {
        campaignId: campaign.id,
        campaignRecipientId: recipient.id,
        subscriberId: sub.id,
        type: EmailEventType.DELIVERED,
        timestamp: new Date('2026-02-15T12:00:15Z'),
      },
    });

    if (i < 3) {
      // Open event
      await prisma.emailEvent.create({
        data: {
          campaignId: campaign.id,
          campaignRecipientId: recipient.id,
          subscriberId: sub.id,
          type: EmailEventType.OPEN,
          ipHash: 'hash-ip-1234',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date('2026-02-15T12:15:00Z'),
        },
      });
    }

    if (i < 2) {
      // Click event
      await prisma.emailEvent.create({
        data: {
          campaignId: campaign.id,
          campaignRecipientId: recipient.id,
          subscriberId: sub.id,
          type: EmailEventType.CLICK,
          url: 'https://disruption.pixlo.local/articles/outbox-pattern',
          ipHash: 'hash-ip-1234',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date('2026-02-15T12:20:00Z'),
        },
      });
    }
  }

  console.log('Pixlo Newsletter Platform seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
