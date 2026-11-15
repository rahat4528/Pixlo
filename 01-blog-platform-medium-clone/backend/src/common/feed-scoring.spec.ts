import { scoreArticleForUser, UserAffinityProfile } from './feed-scoring.util';

describe('Personalized Feed Scoring Engine', () => {
  const affinity: UserAffinityProfile = {
    followedAuthorIds: new Set(['author-1', 'author-2']),
    followedPublicationIds: new Set(['pub-1']),
    preferredTagIds: new Map([
      ['tag-architecture', 5],
      ['tag-typescript', 2],
    ]),
  };

  it('awards +40 points for articles by followed authors', () => {
    const now = new Date();
    const followedAuthorArticle = {
      articleId: 'art-1',
      authorId: 'author-1',
      publicationId: null,
      tagIds: [],
      publishedAt: now,
      viewCount: 0,
      applauseCount: 0,
    };

    const unFollowedArticle = {
      ...followedAuthorArticle,
      articleId: 'art-2',
      authorId: 'author-other',
    };

    const scoreFollowed = scoreArticleForUser(followedAuthorArticle, affinity, now);
    const scoreUnfollowed = scoreArticleForUser(unFollowedArticle, affinity, now);

    expect(scoreFollowed).toBeGreaterThanOrEqual(40);
    expect(scoreUnfollowed).toBeLessThan(40);
  });

  it('awards +20 points for publication affinity', () => {
    const now = new Date();
    const article = {
      articleId: 'art-pub',
      authorId: 'author-stranger',
      publicationId: 'pub-1',
      tagIds: [],
      publishedAt: now,
      viewCount: 0,
      applauseCount: 0,
    };

    const score = scoreArticleForUser(article, affinity, now);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('awards tag affinity bonuses scaled by historical reader affinity', () => {
    const now = new Date();
    const matchedTagArticle = {
      articleId: 'art-tags',
      authorId: 'author-stranger',
      tagIds: ['tag-architecture'],
      publishedAt: now,
      viewCount: 0,
      applauseCount: 0,
    };

    const score = scoreArticleForUser(matchedTagArticle, affinity, now);
    expect(score).toBeGreaterThan(0);
  });

  it('applies exponential recency decay over time (7-day half-life)', () => {
    const now = new Date();
    const recentArticle = {
      articleId: 'art-recent',
      authorId: 'author-1',
      tagIds: [],
      publishedAt: now,
      viewCount: 100,
      applauseCount: 50,
    };

    const oldArticle = {
      ...recentArticle,
      articleId: 'art-old',
      publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days old (2 half-lives)
    };

    const scoreRecent = scoreArticleForUser(recentArticle, affinity, now);
    const scoreOld = scoreArticleForUser(oldArticle, affinity, now);

    // After 14 days (2 half-lives), score should decay to approximately 25% of fresh score
    expect(scoreOld).toBeLessThan(scoreRecent * 0.3);
  });
});
