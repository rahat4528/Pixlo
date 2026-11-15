import { ClusteringWorker, ClusterCandidate } from '../../../workers/clustering-worker';

describe('ClusteringWorker', () => {
  const baseTime = new Date('2026-11-16T10:00:00Z');

  it('should group articles with similar headlines and content into a single cluster', () => {
    const candidates: ClusterCandidate[] = [
      {
        id: 'art-1',
        sourceId: 'src-alpha',
        title: 'Space Agency Announces Commercial Lunar Base Partnership',
        excerpt: 'Space agency administrator unveiled contracts with three aerospace firms for lunar base power grids.',
        publishedAt: new Date(baseTime.getTime() - 3600000), // 1 hr earlier
      },
      {
        id: 'art-2',
        sourceId: 'src-beta',
        title: 'Commercial Lunar Base Contracts Awarded by Space Agency',
        excerpt: 'New lunar surface power infrastructure contracts signed by space agency with aerospace vendors.',
        publishedAt: baseTime,
      },
      {
        id: 'art-3',
        sourceId: 'src-gamma',
        title: 'Municipal Transit Union Approves New Labor Agreement',
        excerpt: 'City transit workers voted overwhelmingly in favor of a three-year wage contract.',
        publishedAt: baseTime,
      },
    ];

    const clusters = ClusteringWorker.clusterArticles(candidates);
    expect(clusters.length).toBe(1);
    expect(clusters[0].articleIds).toContain('art-1');
    expect(clusters[0].articleIds).toContain('art-2');
    expect(clusters[0].articleIds).not.toContain('art-3');
    // art-1 was published earlier, so it is chosen as representative
    expect(clusters[0].representativeArticleId).toBe('art-1');
    expect(clusters[0].distinctSourcesCount).toBe(2);
  });

  it('should flag isBreaking when 3 or more distinct sources publish within 4 hours', () => {
    const candidates: ClusterCandidate[] = [
      {
        id: 'story-1',
        sourceId: 'src-1',
        title: 'Major International Cyber Accord Signed in Geneva',
        excerpt: 'Delegates finalize landmark treaties regarding critical infrastructure security.',
        publishedAt: new Date(baseTime.getTime()),
      },
      {
        id: 'story-2',
        sourceId: 'src-2',
        title: 'Geneva Summit Concludes With Critical Cyber Infrastructure Accord',
        excerpt: 'Cyber security treaty ratified at Geneva summit by participating nations.',
        publishedAt: new Date(baseTime.getTime() + 1800000), // +30m
      },
      {
        id: 'story-3',
        sourceId: 'src-3',
        title: 'Nations Ratify Geneva Accord on Cyber Defense Standards',
        excerpt: 'Critical infrastructure cyber defense standards ratified in Geneva summit treaty.',
        publishedAt: new Date(baseTime.getTime() + 3600000), // +1hr
      },
    ];

    const clusters = ClusteringWorker.clusterArticles(candidates);
    expect(clusters.length).toBe(1);
    expect(clusters[0].isBreaking).toBe(true);
    expect(clusters[0].distinctSourcesCount).toBe(3);
  });

  it('should not cluster completely distinct stories', () => {
    const candidates: ClusterCandidate[] = [
      {
        id: 'art-tech',
        sourceId: 'src-1',
        title: 'Semiconductor Foundry Opens New High-NA Extreme Ultraviolet Plant',
        excerpt: 'State of the art fabrication cleanroom begins production of two nanometer nodes.',
        publishedAt: baseTime,
      },
      {
        id: 'art-sports',
        sourceId: 'src-2',
        title: 'Championship Football League Finals Set for Next Weekend',
        excerpt: 'Undefeated rivals prepare for the annual championship matchup in the national stadium.',
        publishedAt: baseTime,
      },
    ];

    const clusters = ClusteringWorker.clusterArticles(candidates);
    expect(clusters.length).toBe(0);
  });
});
