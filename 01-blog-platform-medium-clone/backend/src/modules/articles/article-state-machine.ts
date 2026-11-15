import { ArticleStatus, PublicationRole } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export interface TransitionContext {
  currentStatus: ArticleStatus;
  targetStatus: ArticleStatus;
  isAuthor: boolean;
  publicationRole?: PublicationRole | null;
  requiresReview: boolean;
  hasScheduledDate?: boolean;
}

export function validateArticleTransition(ctx: TransitionContext): void {
  const { currentStatus, targetStatus, isAuthor, publicationRole, requiresReview, hasScheduledDate } = ctx;

  const isEditorOrOwner = publicationRole === PublicationRole.EDITOR || publicationRole === PublicationRole.OWNER;

  // Direct no-op
  if (currentStatus === targetStatus) return;

  switch (currentStatus) {
    case ArticleStatus.DRAFT:
      if (targetStatus === ArticleStatus.SUBMITTED) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Only the author or publication members can submit');
        }
        return;
      }
      if (targetStatus === ArticleStatus.SCHEDULED) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Not authorized to schedule article');
        }
        if (requiresReview && !isEditorOrOwner) {
          throw new BadRequestException('Articles in this publication require editorial review before scheduling');
        }
        if (!hasScheduledDate) {
          throw new BadRequestException('A scheduled publication date is required');
        }
        return;
      }
      if (targetStatus === ArticleStatus.PUBLISHED) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Not authorized to publish article');
        }
        if (requiresReview && !isEditorOrOwner) {
          throw new BadRequestException('Articles in this publication require editorial review before publishing');
        }
        return;
      }
      break;

    case ArticleStatus.SUBMITTED:
      if (targetStatus === ArticleStatus.IN_REVIEW) {
        if (!isEditorOrOwner) {
          throw new ForbiddenException('Only publication editors and owners can move submissions to review');
        }
        return;
      }
      if (targetStatus === ArticleStatus.DRAFT && isAuthor) {
        return; // Author can withdraw submission
      }
      break;

    case ArticleStatus.IN_REVIEW:
      if (targetStatus === ArticleStatus.APPROVED || targetStatus === ArticleStatus.CHANGES_REQUESTED) {
        if (!isEditorOrOwner) {
          throw new ForbiddenException('Only editors can approve or request changes on submissions');
        }
        return;
      }
      if (targetStatus === ArticleStatus.DRAFT && isAuthor) {
        return;
      }
      break;

    case ArticleStatus.CHANGES_REQUESTED:
      if (targetStatus === ArticleStatus.SUBMITTED) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Only the author or editor can resubmit');
        }
        return;
      }
      if (targetStatus === ArticleStatus.DRAFT && isAuthor) {
        return;
      }
      break;

    case ArticleStatus.APPROVED:
      if (targetStatus === ArticleStatus.PUBLISHED) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Not authorized to publish approved article');
        }
        return;
      }
      if (targetStatus === ArticleStatus.SCHEDULED) {
        if (!hasScheduledDate) {
          throw new BadRequestException('Scheduled date required');
        }
        return;
      }
      if (targetStatus === ArticleStatus.DRAFT) {
        return;
      }
      break;

    case ArticleStatus.SCHEDULED:
      if (targetStatus === ArticleStatus.PUBLISHED) {
        return; // Allowed by system worker or author/editor
      }
      if (targetStatus === ArticleStatus.DRAFT) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Not authorized to unschedule');
        }
        return;
      }
      break;

    case ArticleStatus.PUBLISHED:
      if (targetStatus === ArticleStatus.UNPUBLISHED || targetStatus === ArticleStatus.DRAFT) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Only author or publication editor can unpublish');
        }
        return;
      }
      break;

    case ArticleStatus.UNPUBLISHED:
      if (targetStatus === ArticleStatus.PUBLISHED || targetStatus === ArticleStatus.DRAFT) {
        if (!isAuthor && !isEditorOrOwner) {
          throw new ForbiddenException('Only author or publication editor can republish');
        }
        return;
      }
      break;
  }

  throw new BadRequestException(`Invalid state machine transition from ${currentStatus} to ${targetStatus}`);
}
