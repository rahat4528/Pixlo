import { validateArticleTransition } from './article-state-machine';
import { ArticleStatus, PublicationRole } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('Article State Machine & Role Permission Engine', () => {
  it('allows independent authors to publish directly from DRAFT to PUBLISHED', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.PUBLISHED,
        isAuthor: true,
        publicationRole: null,
        requiresReview: false,
      });
    }).not.toThrow();
  });

  it('allows independent authors to schedule articles when date is set', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.SCHEDULED,
        isAuthor: true,
        publicationRole: null,
        requiresReview: false,
        hasScheduledDate: true,
      });
    }).not.toThrow();
  });

  it('prevents scheduling without a scheduled date', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.SCHEDULED,
        isAuthor: true,
        publicationRole: null,
        requiresReview: false,
        hasScheduledDate: false,
      });
    }).toThrow(BadRequestException);
  });

  it('blocks publication writers from publishing directly when review is required', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.PUBLISHED,
        isAuthor: true,
        publicationRole: PublicationRole.WRITER,
        requiresReview: true,
      });
    }).toThrow(BadRequestException);
  });

  it('allows publication writers to submit articles into SUBMITTED review queue', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.DRAFT,
        targetStatus: ArticleStatus.SUBMITTED,
        isAuthor: true,
        publicationRole: PublicationRole.WRITER,
        requiresReview: true,
      });
    }).not.toThrow();
  });

  it('blocks non-members or random users from moving submissions into review', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.SUBMITTED,
        targetStatus: ArticleStatus.IN_REVIEW,
        isAuthor: false,
        publicationRole: null,
        requiresReview: true,
      });
    }).toThrow(ForbiddenException);
  });

  it('allows publication editors or owners to review and approve submissions', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.SUBMITTED,
        targetStatus: ArticleStatus.IN_REVIEW,
        isAuthor: false,
        publicationRole: PublicationRole.EDITOR,
        requiresReview: true,
      });
    }).not.toThrow();

    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.IN_REVIEW,
        targetStatus: ArticleStatus.APPROVED,
        isAuthor: false,
        publicationRole: PublicationRole.OWNER,
        requiresReview: true,
      });
    }).not.toThrow();
  });

  it('allows authors or editors to unpublish published stories', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.PUBLISHED,
        targetStatus: ArticleStatus.UNPUBLISHED,
        isAuthor: true,
        publicationRole: null,
        requiresReview: false,
      });
    }).not.toThrow();
  });

  it('rejects illegal jumps in the state machine (e.g. SUBMITTED to PUBLISHED)', () => {
    expect(() => {
      validateArticleTransition({
        currentStatus: ArticleStatus.SUBMITTED,
        targetStatus: ArticleStatus.PUBLISHED,
        isAuthor: true,
        publicationRole: PublicationRole.WRITER,
        requiresReview: true,
      });
    }).toThrow(BadRequestException);
  });
});
