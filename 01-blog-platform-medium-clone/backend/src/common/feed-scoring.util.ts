export interface ArticleScoringInputs {
  articleId: string;
  authorId: string;
  publicationId?: string | null;
  tagIds: string[];
  publishedAt: Date;
  viewCount: number;
  applauseCount: number;
}

export interface UserAffinityProfile {
  followedAuthorIds: Set<string>;
  followedPublicationIds: Set<string>;
  preferredTagIds: Map<string, number>; // tagId -> frequency in reading history
}

export function scoreArticleForUser(
  article: ArticleScoringInputs,
  affinity: UserAffinityProfile,
  now: Date = new Date()
): number {
  let score = 0;

  // 1. Author follow affinity (+40)
  if (affinity.followedAuthorIds.has(article.authorId)) {
    score += 40;
  }

  // 2. Publication affinity (+20)
  if (article.publicationId && affinity.followedPublicationIds.has(article.publicationId)) {
    score += 20;
  }

  // 3. Tag affinity (+25 max scaled by frequency)
  if (article.tagIds.length > 0 && affinity.preferredTagIds.size > 0) {
    let matchedWeights = 0;
    for (const tagId of article.tagIds) {
      if (affinity.preferredTagIds.has(tagId)) {
        matchedWeights += Math.min(affinity.preferredTagIds.get(tagId) || 1, 5);
      }
    }
    const tagBonus = Math.min(25, matchedWeights * 5);
    score += tagBonus;
  }

  // 4. Social engagement factor (up to 15 points)
  const engagementBonus = Math.min(15, Math.log10(article.applauseCount + 1) * 5 + Math.log10(article.viewCount + 1) * 2);
  score += engagementBonus;

  // 5. Exponential recency decay (7-day half-life: lambda = ln(2) / 7 = 0.099 days^-1)
  const ageInDays = Math.max(0, (now.getTime() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
  const decayMultiplier = Math.exp(-0.099 * ageInDays);

  return Math.round(score * decayMultiplier * 100) / 100;
}
