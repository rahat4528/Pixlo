import { PrismaClient, UserRole, SourceStatus, FeedFormat, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pixlo News Aggregator Database...');

  // 1. Users
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const readerPasswordHash = await bcrypt.hash('ReaderPass123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pixlo.news' },
    update: {},
    create: {
      email: 'admin@pixlo.news',
      displayName: 'News Desk Administrator',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      preferences: {
        create: {
          preferredCategories: JSON.stringify(['technology', 'business', 'science']),
          preferredTopics: JSON.stringify(['Renewable Energy', 'Artificial Intelligence', 'Space Exploration']),
          emailAlerts: true,
          breakingAlerts: true,
          compactMode: false,
        },
      },
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@pixlo.news' },
    update: {},
    create: {
      email: 'reader@pixlo.news',
      displayName: 'Sarah Jenkins',
      passwordHash: readerPasswordHash,
      role: UserRole.READER,
      preferences: {
        create: {
          preferredCategories: JSON.stringify(['world', 'technology']),
          preferredTopics: JSON.stringify(['Global Economics', 'Cybersecurity']),
          emailAlerts: true,
          breakingAlerts: true,
          compactMode: true,
        },
      },
    },
  });

  // 2. Categories
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Computing, software engineering, AI, and consumer technology', displayOrder: 1 },
    { name: 'Business', slug: 'business', description: 'Financial markets, commerce, economics, and corporate news', displayOrder: 2 },
    { name: 'Science', slug: 'science', description: 'Astronomy, biomedical breakthroughs, climate science, and physics', displayOrder: 3 },
    { name: 'World', slug: 'world', description: 'International affairs, geopolitics, and global developments', displayOrder: 4 },
    { name: 'Local', slug: 'local', description: 'Regional civic updates, municipal reporting, and community initiatives', displayOrder: 5 },
    { name: 'Sports', slug: 'sports', description: 'Athletic competitions, leagues, tournaments, and match analysis', displayOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 3. Topics
  const topics = [
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence', articleCount: 12 },
    { name: 'Renewable Energy', slug: 'renewable-energy', articleCount: 8 },
    { name: 'Space Exploration', slug: 'space-exploration', articleCount: 6 },
    { name: 'Global Economics', slug: 'global-economics', articleCount: 9 },
    { name: 'Cybersecurity', slug: 'cybersecurity', articleCount: 7 },
  ];

  for (const top of topics) {
    await prisma.articleTopic.upsert({
      where: { slug: top.slug },
      update: top,
      create: top,
    });
  }

  // 4. News Sources
  const sourcesData = [
    {
      name: 'Global Chronicle',
      slug: 'global-chronicle',
      websiteUrl: 'https://globalchronicle.org',
      logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=128&h=128&fit=crop',
      description: 'Independent reporting on international geopolitics, diplomacy, and global affairs.',
      category: 'world',
      feedUrl: 'https://globalchronicle.org/rss/world.xml',
    },
    {
      name: 'Tech Horizon',
      slug: 'tech-horizon',
      websiteUrl: 'https://techhorizon.io',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&h=128&fit=crop',
      description: 'In-depth analysis of emerging software systems, semiconductor chips, and tech policies.',
      category: 'technology',
      feedUrl: 'https://techhorizon.io/feed.xml',
    },
    {
      name: 'Market Pulse Daily',
      slug: 'market-pulse-daily',
      websiteUrl: 'https://marketpulse.news',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&h=128&fit=crop',
      description: 'Daily market summaries, interest rate forecasts, and macro trends.',
      category: 'business',
      feedUrl: 'https://marketpulse.news/rss/financial.xml',
    },
    {
      name: 'Quantum Science Review',
      slug: 'quantum-science-review',
      websiteUrl: 'https://quantumsciencereview.net',
      logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=128&h=128&fit=crop',
      description: 'Peer-reviewed research digests spanning astrophysics, biotechnology, and material sciences.',
      category: 'science',
      feedUrl: 'https://quantumsciencereview.net/atom.xml',
    },
  ];

  const createdSources: Record<string, any> = {};

  for (const s of sourcesData) {
    const src = await prisma.newsSource.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        websiteUrl: s.websiteUrl,
        logoUrl: s.logoUrl,
        description: s.description,
        category: s.category,
        status: SourceStatus.ACTIVE,
      },
      create: {
        name: s.name,
        slug: s.slug,
        websiteUrl: s.websiteUrl,
        logoUrl: s.logoUrl,
        description: s.description,
        category: s.category,
        status: SourceStatus.ACTIVE,
      },
    });

    const feed = await prisma.feedSource.upsert({
      where: { url: s.feedUrl },
      update: {
        format: s.feedUrl.endsWith('.xml') ? FeedFormat.RSS : FeedFormat.ATOM,
        refreshIntervalMinutes: 15,
        isActive: true,
      },
      create: {
        sourceId: src.id,
        url: s.feedUrl,
        format: s.feedUrl.endsWith('.xml') ? FeedFormat.RSS : FeedFormat.ATOM,
        refreshIntervalMinutes: 15,
        isActive: true,
      },
    });

    createdSources[s.slug] = { source: src, feed };
  }

  // 5. Story Cluster 1: Clean Energy Storage
  const clusterBattery = await prisma.storyCluster.create({
    data: {
      title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
      category: 'science',
      articleCount: 2,
      isBreaking: true,
      firstPublishedAt: new Date(Date.now() - 3600000 * 4),
      lastPublishedAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  const articleBattery1 = await prisma.newsArticle.create({
    data: {
      sourceId: createdSources['quantum-science-review'].source.id,
      clusterId: clusterBattery.id,
      guid: 'qsr-2026-sodium-battery-breakthrough',
      title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
      normalizedTitleHash: 'solidstatesodiumbatterypilotdemonstrates80costreductionforgridstorage',
      canonicalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
      originalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026?utm_source=rss&utm_medium=feed',
      excerpt: 'Researchers at the Materials Innovation Consortium have concluded a six-month grid-scale test of high-density solid-state sodium cells, revealing sustained 94% Coulombic efficiency across 1,200 continuous thermal cycles.',
      authorName: 'Dr. Elena Rostova',
      publishedAt: new Date(Date.now() - 3600000 * 4),
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&fit=crop',
      category: 'science',
      isBreaking: true,
    },
  });

  await prisma.storyCluster.update({
    where: { id: clusterBattery.id },
    data: { representativeArticleId: articleBattery1.id },
  });

  const articleBattery2 = await prisma.newsArticle.create({
    data: {
      sourceId: createdSources['tech-horizon'].source.id,
      clusterId: clusterBattery.id,
      guid: 'th-2026-grid-scale-sodium-cells',
      title: 'How Sodium Solid-State Batteries Could Disrupt Lithium Infrastructure This Decade',
      normalizedTitleHash: 'howsodiumsolidstatebatteriescoulddisruptlithiuminfrastructurethisdecade',
      canonicalUrl: 'https://techhorizon.io/hardware/sodium-solid-state-batteries-analysis',
      originalUrl: 'https://techhorizon.io/hardware/sodium-solid-state-batteries-analysis?ref=feed',
      excerpt: 'Industrial utilities are preparing pilot orders for sodium-based grid batteries following verified test benchmarks showing minimal degradation in sub-zero and extreme-heat environments without expensive cooling loops.',
      authorName: 'Julian Vance',
      publishedAt: new Date(Date.now() - 3600000 * 2),
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&fit=crop',
      category: 'technology',
      isBreaking: true,
    },
  });

  // 6. Independent Articles
  const articleTech = await prisma.newsArticle.create({
    data: {
      sourceId: createdSources['tech-horizon'].source.id,
      guid: 'th-2026-distributed-operating-system',
      title: 'Microkernel Architecture Gaining Adoption in Edge Cloud Workloads',
      normalizedTitleHash: 'microkernelarchitecturegainingadoptioninedgecloudworkloads',
      canonicalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
      originalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
      excerpt: 'Hyperscale providers are experimenting with capability-based microkernels for serverless tasks, cutting cold boot latencies to sub-millisecond ranges while enforcing hardware-enforced memory safety isolation.',
      authorName: 'Marcus Aurelius Sterling',
      publishedAt: new Date(Date.now() - 3600000 * 8),
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop',
      category: 'technology',
    },
  });

  const articleMarket = await prisma.newsArticle.create({
    data: {
      sourceId: createdSources['market-pulse-daily'].source.id,
      guid: 'mpd-2026-central-bank-rates',
      title: 'Central Banks Signal Coordinated Liquidity Framework for Digital Currencies',
      normalizedTitleHash: 'centralbankssignalcoordinatedliquidityframeworkfordigitalcurrencies',
      canonicalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework',
      originalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework?utm_campaign=daily',
      excerpt: 'A cross-border coalition of monetary authorities published a joint protocol draft establishing real-time clearing standards for institutional tokenized settlement systems and sovereign digital reserves.',
      authorName: 'Clarissa Montgomery',
      publishedAt: new Date(Date.now() - 3600000 * 12),
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&fit=crop',
      category: 'business',
    },
  });

  const articleWorld = await prisma.newsArticle.create({
    data: {
      sourceId: createdSources['global-chronicle'].source.id,
      guid: 'gc-2026-treaty-deep-sea-minerals',
      title: 'International Seabed Assembly Ratifies Marine Environmental Protection Accord',
      normalizedTitleHash: 'internationalseabedassemblyratifiesmarineenvironmentalprotectionaccord',
      canonicalUrl: 'https://globalchronicle.org/diplomacy/seabed-environmental-treaty-signed',
      originalUrl: 'https://globalchronicle.org/diplomacy/seabed-environmental-treaty-signed',
      excerpt: 'Delegates from 140 nations ratified an unprecedented environmental code governing exploratory extraction in international waters, creating binding buffer zones around hydrothermal vents and abyssal plains.',
      authorName: 'Henrik Lindqvist',
      publishedAt: new Date(Date.now() - 3600000 * 16),
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&fit=crop',
      category: 'world',
    },
  });

  // Source mappings
  await prisma.articleSourceMapping.createMany({
    data: [
      { articleId: articleBattery1.id, sourceId: createdSources['quantum-science-review'].source.id, feedSourceId: createdSources['quantum-science-review'].feed.id },
      { articleId: articleBattery2.id, sourceId: createdSources['tech-horizon'].source.id, feedSourceId: createdSources['tech-horizon'].feed.id },
      { articleId: articleTech.id, sourceId: createdSources['tech-horizon'].source.id, feedSourceId: createdSources['tech-horizon'].feed.id },
      { articleId: articleMarket.id, sourceId: createdSources['market-pulse-daily'].source.id, feedSourceId: createdSources['market-pulse-daily'].feed.id },
      { articleId: articleWorld.id, sourceId: createdSources['global-chronicle'].source.id, feedSourceId: createdSources['global-chronicle'].feed.id },
    ],
    skipDuplicates: true,
  });

  // Saved Articles & History
  await prisma.savedArticle.create({
    data: {
      userId: reader.id,
      articleId: articleBattery1.id,
      notes: 'Essential benchmark figures for grid battery performance analysis.',
    },
  });

  await prisma.readingHistory.create({
    data: {
      userId: reader.id,
      articleId: articleTech.id,
      durationSeconds: 145,
    },
  });

  await prisma.followedSource.create({
    data: {
      userId: reader.id,
      sourceId: createdSources['quantum-science-review'].source.id,
    },
  });

  // Ingestion Job Log
  await prisma.ingestionJob.create({
    data: {
      feedSourceId: createdSources['quantum-science-review'].feed.id,
      status: JobStatus.COMPLETED,
      itemsFound: 5,
      itemsIngested: 1,
      itemsDuplicated: 4,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3600000 + 1200),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
