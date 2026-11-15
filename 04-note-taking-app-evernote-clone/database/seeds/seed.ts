import { PrismaClient, BlockType, RevisionReason, ShareRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pixlo Note-Taking App Database...');

  // 1. User
  const passwordHash = await bcrypt.hash('EvernotePass123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'notes@pixlo.io' },
    update: {},
    create: {
      email: 'notes@pixlo.io',
      displayName: 'Alex Thorne',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
    },
  });

  // 2. Notebook Stacks
  const workStack = await prisma.notebookStack.upsert({
    where: { userId_name: { userId: user.id, name: 'Engineering & Work' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Engineering & Work',
    },
  });

  const personalStack = await prisma.notebookStack.upsert({
    where: { userId_name: { userId: user.id, name: 'Personal & Knowledge' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Personal & Knowledge',
    },
  });

  // 3. Notebooks
  const defaultNotebook = await prisma.notebook.upsert({
    where: { userId_name: { userId: user.id, name: 'Daily Inbox' } },
    update: {},
    create: {
      userId: user.id,
      name: 'Daily Inbox',
      isDefault: true,
      color: '#059669', // Emerald
    },
  });

  const archNotebook = await prisma.notebook.upsert({
    where: { userId_name: { userId: user.id, name: 'System Architecture' } },
    update: { stackId: workStack.id },
    create: {
      userId: user.id,
      stackId: workStack.id,
      name: 'System Architecture',
      color: '#2563eb', // Blue
    },
  });

  const booksNotebook = await prisma.notebook.upsert({
    where: { userId_name: { userId: user.id, name: 'Book Summaries' } },
    update: { stackId: personalStack.id },
    create: {
      userId: user.id,
      stackId: personalStack.id,
      name: 'Book Summaries',
      color: '#7c3aed', // Purple
    },
  });

  // 4. Tags
  const tagsData = [
    { name: 'Architecture', slug: 'architecture', color: '#2563eb' },
    { name: 'Critical', slug: 'critical', color: '#dc2626' },
    { name: 'Review', slug: 'review', color: '#f59e0b' },
    { name: 'Ideas', slug: 'ideas', color: '#10b981' },
  ];

  const createdTags: Record<string, any> = {};
  for (const t of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { userId_slug: { userId: user.id, slug: t.slug } },
      update: {},
      create: {
        userId: user.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
      },
    });
    createdTags[t.slug] = tag;
  }

  // 5. Notes
  const note1Content = `
# Offline-First Concurrency Model

Our client-side sync layer coordinates edits between local IndexedDB and server PostgreSQL.

## Architecture Guidelines
- Notes hold a monotonic serverRevision integer.
- Edits submit the baseRevision they branched from.
- 3-way text merger resolves non-overlapping edits.
- Overlapping diffs fork into an explicit conflict copy.

\`\`\`typescript
interface SyncEnvelope {
  noteId: string;
  clientOpId: string;
  baseRevision: number;
  contentDiff: string;
}
\`\`\`

### Verification Checklist
- [x] Optimistic Concurrency 409 rejection verified
- [x] Client FIFO queue replay tested with retry backoff
- [ ] Implement browser camera document scanning
`;

  const note1 = await prisma.note.create({
    data: {
      userId: user.id,
      notebookId: archNotebook.id,
      title: 'Offline-First Concurrency Model',
      content: note1Content,
      plainText: 'Offline-First Concurrency Model. Our client-side sync layer coordinates edits between local IndexedDB and server PostgreSQL.',
      isPinned: true,
      isStarred: true,
      serverRevision: 3,
      revisions: {
        create: [
          {
            revisionNumber: 1,
            title: 'Offline Concurrency Draft',
            content: '# Initial Draft of Concurrency Rules',
            plainText: 'Initial Draft of Concurrency Rules',
            reason: RevisionReason.MANUAL_SAVE,
          },
          {
            revisionNumber: 2,
            title: 'Offline-First Concurrency Model',
            content: note1Content.slice(0, 300),
            plainText: 'Draft with initial checklist',
            reason: RevisionReason.AUTOSAVE,
          },
          {
            revisionNumber: 3,
            title: 'Offline-First Concurrency Model',
            content: note1Content,
            plainText: 'Finalized specification with code block and verification checklist',
            reason: RevisionReason.MANUAL_SAVE,
          },
        ],
      },
      tags: {
        create: [
          { tagId: createdTags['architecture'].id },
          { tagId: createdTags['critical'].id },
        ],
      },
      reminders: {
        create: {
          userId: user.id,
          remindAt: new Date(Date.now() + 86400000 * 2), // in 2 days
          recurrence: 'NONE',
        },
      },
    },
  });

  const note2Content = `
# Weekly Sprint Action Items

- [x] Complete Phase 3 News Aggregator
- [x] Test RSS and Atom parsing streams
- [ ] Implement Note-Taking optimistic concurrency
- [ ] Verify device session revocation
`;

  await prisma.note.create({
    data: {
      userId: user.id,
      notebookId: defaultNotebook.id,
      title: 'Weekly Sprint Action Items',
      content: note2Content,
      plainText: 'Weekly Sprint Action Items. Complete Phase 3 News Aggregator. Test RSS and Atom parsing streams.',
      isPinned: false,
      isStarred: false,
      serverRevision: 1,
      tags: {
        create: [{ tagId: createdTags['ideas'].id }],
      },
    },
  });

  // 6. Device Sessions
  await prisma.deviceSession.upsert({
    where: { userId_deviceId: { userId: user.id, deviceId: 'macbook-pro-m3-01' } },
    update: {},
    create: {
      userId: user.id,
      deviceId: 'macbook-pro-m3-01',
      deviceName: 'MacBook Pro 16" (Workstation)',
      platform: 'macOS',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ipAddress: '198.51.100.42',
      lastSyncAt: new Date(),
    },
  });

  await prisma.deviceSession.upsert({
    where: { userId_deviceId: { userId: user.id, deviceId: 'iphone-15-pro-02' } },
    update: {},
    create: {
      userId: user.id,
      deviceId: 'iphone-15-pro-02',
      deviceName: 'iPhone 15 Pro (Mobile)',
      platform: 'iOS',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
      ipAddress: '198.51.100.89',
      lastSyncAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  console.log('Seeding completed successfully for Note-Taking App!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
