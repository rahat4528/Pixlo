import { PrismaClient, UserRole, PublicationRole, ArticleStatus, ReactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('--- Starting Pixlo Blog Platform Seeding ---');

  // Clear existing records in reverse dependency order
  await prisma.articleAnalytics.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.readingListItem.deleteMany();
  await prisma.readingList.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.editorialReview.deleteMany();
  await prisma.articleImage.deleteMany();
  await prisma.articleBlock.deleteMany();
  await prisma.articleRevision.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.publicationMember.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.authorProfile.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPass = await bcrypt.hash('Admin123!', saltRounds);
  const authorPass = await bcrypt.hash('Author123!', saltRounds);
  const readerPass = await bcrypt.hash('Reader123!', saltRounds);

  // 1. Create Users & Profiles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pixlo.local',
      passwordHash: adminPass,
      role: UserRole.ADMIN,
      profile: {
        create: {
          username: 'admin',
          displayName: 'Pixlo Administrator',
          bio: 'Platform maintainer and editorial board supervisor.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        },
      },
    },
    include: { profile: true },
  });

  const authorElena = await prisma.user.create({
    data: {
      email: 'elena.rostova@pixlo.local',
      passwordHash: authorPass,
      role: UserRole.AUTHOR,
      profile: {
        create: {
          username: 'elena_writes',
          displayName: 'Elena Rostova',
          bio: 'Principal Distributed Systems Architect. Writes about consensus protocols, resilient telemetry, and zero-downtime scaling.',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          socialLinks: { twitter: 'elena_arch', github: 'elena-rostova' },
          isPaidAuthor: true,
        },
      },
    },
    include: { profile: true },
  });

  const authorMarcus = await prisma.user.create({
    data: {
      email: 'marcus.chen@pixlo.local',
      passwordHash: authorPass,
      role: UserRole.AUTHOR,
      profile: {
        create: {
          username: 'marcus_codes',
          displayName: 'Marcus Chen',
          bio: 'Staff Frontend Engineer & Design Systems Specialist. Passionate about typographic rhythm and web performance.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          socialLinks: { twitter: 'marcus_fe', website: 'https://marcuschen.dev' },
          isPaidAuthor: false,
        },
      },
    },
    include: { profile: true },
  });

  const readerSarah = await prisma.user.create({
    data: {
      email: 'sarah.jenkins@pixlo.local',
      passwordHash: readerPass,
      role: UserRole.READER,
      profile: {
        create: {
          username: 'sarah_reads',
          displayName: 'Sarah Jenkins',
          bio: 'Avid engineering reader and tech lead.',
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
        },
      },
    },
    include: { profile: true },
  });

  const readerDavid = await prisma.user.create({
    data: {
      email: 'david.kim@pixlo.local',
      passwordHash: readerPass,
      role: UserRole.READER,
      profile: {
        create: {
          username: 'david_k',
          displayName: 'David Kim',
          bio: 'Backend enthusiast and graduate computer science student.',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        },
      },
    },
    include: { profile: true },
  });

  // 2. Follow Graph
  await prisma.follow.createMany({
    data: [
      { followerId: readerSarah.id, followeeId: authorElena.id },
      { followerId: readerSarah.id, followeeId: authorMarcus.id },
      { followerId: readerDavid.id, followeeId: authorElena.id },
      { followerId: authorMarcus.id, followeeId: authorElena.id },
    ],
  });

  // 3. Paid Membership Grant
  await prisma.membership.create({
    data: {
      userId: readerSarah.id,
      targetAuthorId: authorElena.id,
      status: 'ACTIVE',
      tier: 'premium_author_supporter',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Categories & Tags
  const catArchitecture = await prisma.category.create({
    data: {
      name: 'Software Architecture',
      slug: 'software-architecture',
      description: 'System design, microservices, and distributed computing patterns.',
    },
  });

  const catFrontend = await prisma.category.create({
    data: {
      name: 'Frontend Craft',
      slug: 'frontend-craft',
      description: 'Modern component architectures, CSS typography, and web performance.',
    },
  });

  const tagDistributed = await prisma.tag.create({ data: { name: 'Distributed Systems', slug: 'distributed-systems' } });
  const tagPerformance = await prisma.tag.create({ data: { name: 'Performance', slug: 'performance' } });
  const tagTypeScript = await prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } });
  const tagDesignSystems = await prisma.tag.create({ data: { name: 'Design Systems', slug: 'design-systems' } });

  // 5. Multi-author Publication
  const pub = await prisma.publication.create({
    data: {
      name: 'Architectural Horizons',
      slug: 'architectural-horizons',
      description: 'In-depth perspectives on modern distributed software engineering.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      requireReview: true,
      members: {
        create: [
          { userId: authorElena.id, role: PublicationRole.OWNER },
          { userId: authorMarcus.id, role: PublicationRole.EDITOR },
        ],
      },
    },
  });

  // 6. Articles
  // Article 1: Public Article by Elena
  const article1 = await prisma.article.create({
    data: {
      authorId: authorElena.id,
      publicationId: pub.id,
      categoryId: catArchitecture.id,
      title: 'Architecting Resilient Distributed Systems for High-Throughput Workloads',
      slug: 'architecting-resilient-distributed-systems',
      excerpt: 'How to combine backpressure, circuit breakers, and stateful partitioned queues to withstand unpredictable traffic storms.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '1. The Illusion of Synchronous Reliability' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Every distributed system is prone to latency degradation when downstream services saturate. A common mistake is relying on synchronous cascade calls without bounded timeouts.',
              },
            ],
          },
          {
            type: 'codeBlock',
            attrs: { language: 'typescript' },
            content: [
              {
                type: 'text',
                text: 'export class CircuitBreaker {\n  private failures = 0;\n  private state: "CLOSED" | "OPEN" = "CLOSED";\n  async execute<T>(fn: () => Promise<T>): Promise<T> {\n    if (this.state === "OPEN") throw new Error("Circuit is open");\n    try { return await fn(); } catch (err) { this.failures++; throw err; }\n  }\n}',
              },
            ],
          },
        ],
      },
      htmlContent: '<h2>1. The Illusion of Synchronous Reliability</h2><p>Every distributed system is prone to latency degradation when downstream services saturate. A common mistake is relying on synchronous cascade calls without bounded timeouts.</p><pre><code class="language-typescript">export class CircuitBreaker {\n  private failures = 0;\n  private state: "CLOSED" | "OPEN" = "CLOSED";\n  async execute&lt;T&gt;(fn: () =&gt; Promise&lt;T&gt;): Promise&lt;T&gt; {\n    if (this.state === "OPEN") throw new Error("Circuit is open");\n    try { return await fn(); } catch (err) { this.failures++; throw err; }\n  }\n}</code></pre>',
      coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      readingTimeMinutes: 4,
      isMembersOnly: false,
      viewCount: 1420,
      applauseCount: 88,
      tags: {
        create: [
          { tagId: tagDistributed.id },
          { tagId: tagPerformance.id },
        ],
      },
      revisions: {
        create: [
          {
            version: 1,
            title: 'Architecting Resilient Distributed Systems for High-Throughput Workloads',
            content: { type: 'doc' },
            summary: 'Initial published draft',
            createdBy: authorElena.id,
          },
        ],
      },
    },
  });

  // Article 2: Members-Only Article by Elena (Paywall demonstration)
  const article2 = await prisma.article.create({
    data: {
      authorId: authorElena.id,
      publicationId: pub.id,
      categoryId: catArchitecture.id,
      title: 'Advanced Raft Consensus Internals: Log Compaction and Leader Leases',
      slug: 'advanced-raft-consensus-internals',
      excerpt: 'An exclusive deep-dive into snapshot serialization, disk flush latency, and lease-based linearizable reads.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Linearizable reads in standard consensus protocols require contacting a majority of peers for each read.' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'By utilizing leader leases synchronized with monotonic physical clocks, leaders can serve read requests locally without round-trips.' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Detailed implementation details and mathematical safety proofs continue below for members...' }],
          },
        ],
      },
      htmlContent: '<p>Linearizable reads in standard consensus protocols require contacting a majority of peers for each read.</p><p>By utilizing leader leases synchronized with monotonic physical clocks, leaders can serve read requests locally without round-trips.</p><p>Detailed implementation details and mathematical safety proofs continue below for members...</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      readingTimeMinutes: 6,
      isMembersOnly: true,
      viewCount: 650,
      applauseCount: 42,
      tags: {
        create: [{ tagId: tagDistributed.id }],
      },
    },
  });

  // Article 3: Frontend Craft by Marcus
  const article3 = await prisma.article.create({
    data: {
      authorId: authorMarcus.id,
      categoryId: catFrontend.id,
      title: 'Typography and Rhythm: Building Editorial Interfaces with Variable Fonts',
      slug: 'typography-and-rhythm-editorial-interfaces',
      excerpt: 'Creating reading column harmony, dynamic optical sizing, and baseline grids for immersive long-form experiences.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Typography is 95% of web design, especially when creating reading environments that honor the written word.' }],
          },
        ],
      },
      htmlContent: '<p>Typography is 95% of web design, especially when creating reading environments that honor the written word.</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      readingTimeMinutes: 3,
      isMembersOnly: false,
      viewCount: 410,
      applauseCount: 29,
      tags: {
        create: [
          { tagId: tagDesignSystems.id },
          { tagId: tagTypeScript.id },
        ],
      },
    },
  });

  // 7. Reactions & Comments
  await prisma.reaction.createMany({
    data: [
      { articleId: article1.id, userId: readerSarah.id, type: ReactionType.APPLAUSE, count: 25 },
      { articleId: article1.id, userId: readerDavid.id, type: ReactionType.INSIGHTFUL, count: 1 },
      { articleId: article3.id, userId: readerSarah.id, type: ReactionType.HEART, count: 1 },
    ],
  });

  const parentComment = await prisma.comment.create({
    data: {
      articleId: article1.id,
      authorId: readerDavid.id,
      content: 'Exceptional breakdown of circuit breaker states! How do you handle half-open state probing in high-traffic services?',
    },
  });

  await prisma.comment.create({
    data: {
      articleId: article1.id,
      authorId: authorElena.id,
      parentId: parentComment.id,
      content: 'Great question David. We use canary trial percentages: allowing only 1% of incoming traffic through while half-open rather than a binary switch.',
    },
  });

  // 8. Bookmarks & Reading History
  await prisma.bookmark.create({
    data: {
      articleId: article1.id,
      userId: readerSarah.id,
    },
  });

  await prisma.readingHistory.create({
    data: {
      articleId: article1.id,
      userId: readerSarah.id,
      readPercent: 1.0,
      scrollDepth: 1.0,
      timeSpentSeconds: 240,
    },
  });

  // 9. Reading Lists
  const readingList = await prisma.readingList.create({
    data: {
      userId: readerSarah.id,
      name: 'Essential Distributed Systems',
      isPrivate: false,
      items: {
        create: [
          { articleId: article1.id },
          { articleId: article2.id },
        ],
      },
    },
  });

  console.log('--- Seed Finished Successfully ---');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@pixlo.local / Admin123!');
  console.log('  Author:  elena.rostova@pixlo.local / Author123! (Paid Author)');
  console.log('  Author:  marcus.chen@pixlo.local / Author123!');
  console.log('  Reader:  sarah.jenkins@pixlo.local / Reader123! (Has Paid Membership)');
  console.log('  Reader:  david.kim@pixlo.local / Reader123!');
}

if (require.main === module) {
  seedDatabase()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
