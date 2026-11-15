/**
 * End-to-End Workflow Verification for Pixlo Blog Platform
 * Validates the complete lifecycle from author draft to reader engagement.
 */

import { calculateReadingTime } from '../backend/src/common/reading-time.util';
import { sanitizeArticleHtml, sanitizeComment } from '../backend/src/common/sanitize.util';
import { validateArticleTransition } from '../backend/src/modules/articles/article-state-machine';
import { scoreArticleForUser } from '../backend/src/common/feed-scoring.util';
import { ArticleStatus, PublicationRole } from '../backend/node_modules/@prisma/client';

describe('Pixlo Blog Platform End-to-End Workflow Verification', () => {
  it('exercises full author publishing lifecycle and reading engagement loop', () => {
    // 1. Author writes an article draft with formatted text and code
    const rawContent = `
      <h2>Zero-Downtime Database Migration Strategies</h2>
      <p>Migrating large-scale databases requires expand and contract schema migration patterns.</p>
      <pre><code class="language-sql">ALTER TABLE users ADD COLUMN display_name_v2 VARCHAR(100);</code></pre>
      <p>Dual-writing during active traffic maintains consistency across old and new models.</p>
    `;

    // 2. Content is sanitized with allowlist
    const sanitizedHtml = sanitizeArticleHtml(rawContent);
    expect(sanitizedHtml).toContain('Zero-Downtime Database Migration Strategies');
    expect(sanitizedHtml).not.toContain('<script>');

    // 3. Deterministic reading time is computed
    const readingTime = calculateReadingTime(sanitizedHtml);
    expect(readingTime).toBeGreaterThanOrEqual(1);

    // 4. Article state machine: Author submits to publication with editorial review
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.SUBMITTED,
        isAuthor: true,
        publicationRole: PublicationRole.WRITER,
        requiresReview: true,
      });
    }).not.toThrow();

    // 5. Publication editor moves submission to review
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.SUBMITTED,
        targetStatus: ArticleStatus.IN_REVIEW,
        isAuthor: false,
        publicationRole: PublicationRole.EDITOR,
        requiresReview: true,
      });
    }).not.toThrow();

    // 6. Publication editor approves article
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.IN_REVIEW,
        targetStatus: ArticleStatus.APPROVED,
        isAuthor: false,
        publicationRole: PublicationRole.EDITOR,
        requiresReview: true,
      });
    }).not.toThrow();

    // 7. Approved article is published
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.APPROVED,
        targetStatus: ArticleStatus.PUBLISHED,
        isAuthor: true,
        publicationRole: PublicationRole.WRITER,
        requiresReview: true,
      });
    }).not.toThrow();

    // 8. Reader personalized feed scores article
    const feedScore = scoreArticleForUser(
      {
        articleId: 'art-e2e',
        authorId: 'elena-writes',
        publicationId: 'pub-arch',
        tagIds: ['tag-database'],
        publishedAt: new Date(),
        viewCount: 10,
        applauseCount: 5,
      },
      {
        followedAuthorIds: new Set(['elena-writes']),
        followedPublicationIds: new Set(['pub-arch']),
        preferredTagIds: new Map([['tag-database', 3]]),
      }
    );
    expect(feedScore).toBeGreaterThan(60); // Author (+40) + Pub (+20) + Tag bonus

    // 9. Reader posts a comment on the published article
    const commentInput = 'Great pattern! We used this to migrate 50 million rows.';
    const cleanComment = sanitizeComment(commentInput);
    expect(cleanComment).toBe(commentInput);
  });
});
