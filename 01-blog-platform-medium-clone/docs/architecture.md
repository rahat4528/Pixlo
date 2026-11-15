# Blog Platform (Medium Clone) — Architecture Blueprint

## 1. System Overview
The Blog Platform is built as a decoupled full-stack application comprising:
- **Frontend**: Next.js 14/15 application rendering the public reading experience (SSR / ISR for high SEO performance), a distraction-free rich text editor, and the Author Studio dashboard.
- **Backend**: NestJS application exposing a RESTful OpenAPI-documented API, enforcing authentication, state machines, permission matrices, feed scoring, and analytics processing.
- **Persistence**: Dedicated PostgreSQL database (`pixlo_blog_db`) managed via Prisma ORM.
- **Caching & Async Processing**: Redis for feed cache and session tracking; BullMQ for scheduled publishing jobs and notification dispatches.
- **Storage**: Local filesystem or S3-compatible object storage with image mime-type validation and size controls.

---

## 2. Domain Data Model

```
User (1) ---- (1) AuthorProfile
User (1) ---- (N) PublicationMember ---- (N) Publication
User (1) ---- (N) Article (as Author)
User (1) ---- (N) Follow (follower / followee)
User (1) ---- (N) Reaction
User (1) ---- (N) Comment
User (1) ---- (N) Bookmark
User (1) ---- (N) ReadingHistory
User (1) ---- (N) ReadingList ---- (N) ReadingListItem

Article (1) ---- (N) ArticleRevision
Article (1) ---- (N) ArticleTag ---- (N) Tag
Article (N) ---- (1) Category
Article (1) ---- (N) Reaction
Article (1) ---- (N) Comment
Article (1) ---- (N) ArticleAnalytics
Article (N) ---- (0..1) Publication
Article (1) ---- (0..1) EditorialReview
```

### Key Entities & Attributes

1. **User**: `id`, `email`, `passwordHash`, `role` (USER, AUTHOR, ADMIN), `createdAt`, `updatedAt`.
2. **AuthorProfile**: `id`, `userId`, `username`, `displayName`, `bio`, `avatarUrl`, `socialLinks` (JSON), `isPaidAuthor`.
3. **Publication**: `id`, `name`, `slug`, `description`, `logoUrl`, `coverImageUrl`, `requireReview` (boolean), `createdAt`.
4. **PublicationMember**: `id`, `publicationId`, `userId`, `role` (OWNER, EDITOR, WRITER), `joinedAt`.
5. **Article**:
   - `id`, `authorId`, `publicationId` (nullable)
   - `title`, `slug`, `excerpt`, `content` (JSON structured blocks), `htmlContent` (sanitized)
   - `coverImageUrl`, `categoryId`, `status` (DRAFT, SUBMITTED, IN_REVIEW, CHANGES_REQUESTED, APPROVED, SCHEDULED, PUBLISHED, UNPUBLISHED)
   - `scheduledAt`, `publishedAt`, `readingTimeMinutes`, `isMembersOnly`, `viewCount`, `applauseCount`
6. **ArticleRevision**: `id`, `articleId`, `version`, `title`, `content`, `createdAt`, `createdByUserId`.
7. **EditorialReview**: `id`, `articleId`, `reviewerId`, `status`, `reviewNotes`, `reviewedAt`.
8. **Comment**: `id`, `articleId`, `authorId`, `parentId` (for nested replies), `content`, `isModerated`, `moderationReason`, `createdAt`.
9. **Reaction**: `id`, `articleId`, `userId`, `type` (APPLAUSE, INSIGHTFUL, HEART), `count` (1-50 for applause).
10. **ArticleAnalytics**: `id`, `articleId`, `sessionId`, `viewedAt`, `readCompletionPercent`, `timeSpentSeconds`, `deviceType`.
11. **Membership**: `id`, `userId`, `authorId` / `publicationId`, `status` (ACTIVE, CANCELLED), `tier`, `expiresAt`.

---

## 3. Article State Machine & Transition Rules

```
       +-----------------------+
       |         DRAFT         |<-----------------------+
       +-----------------------+                        |
         |         |         |                          |
(Author  | (Submit |         |                          |
 Direct) |  to Pub)|         |                          |
         v         v         |                          |
  +-----------+  +---------+ |                          |
  | SCHEDULED |  |SUBMITTED| |                          |
  +-----------+  +---------+ |                          |
        |             |      |                          |
(Worker |      (Editor|      |                          |
 Trigger)       Review)      |                          |
        |             v      |                          |
        |      +-----------+ |                          |
        |      | IN_REVIEW | |                          |
        |      +-----------+ |                          |
        |        |       |   |                          |
        | (Accept|       | (Request                     |
        |        v       |  Changes)                    |
        |  +----------+  |   v                          |
        |  | APPROVED |  +---+ CHANGES_REQUESTED        |
        |  +----------+                                 |
        |        |                                      |
        +---+----+                                      |
            |                                           |
            v                                           |
     +-----------+                                      |
     | PUBLISHED |--------------------------------------+
     +-----------+         (Author/Editor Unpublish)
            |
            v
    +-------------+
    | UNPUBLISHED |
    +-------------+
```

### Transition Authority Matrix

| Transition | Who Can Execute | Preconditions |
|---|---|---|
| `DRAFT -> PUBLISHED` | Author (personal), Publication OWNER/EDITOR | Content & Title valid; no publication review required |
| `DRAFT -> SCHEDULED` | Author (personal), Publication OWNER/EDITOR | `scheduledAt` > current time |
| `DRAFT -> SUBMITTED` | Author / Publication WRITER | Target publication has `requireReview = true` |
| `SUBMITTED -> IN_REVIEW` | Publication OWNER or EDITOR | Assigns `reviewerId` |
| `IN_REVIEW -> CHANGES_REQUESTED` | Reviewer / Publication EDITOR | Must provide `reviewNotes` |
| `IN_REVIEW -> APPROVED` | Reviewer / Publication EDITOR | Notes optional |
| `APPROVED -> PUBLISHED` | Reviewer / Publication EDITOR / Author | Publication ready |
| `PUBLISHED -> UNPUBLISHED` | Author or Publication EDITOR | Reverts public visibility |
| `Any -> DRAFT` | Author | Allows revision edits |

---

## 4. Reading Time Calculation Formula

The reading time engine applies a deterministic formula:
$$\text{Words} = \text{wordCount}(\text{plainTextContent})$$
$$\text{BaseMinutes} = \frac{\text{Words}}{200}$$
$$\text{ImageAdjustmentMinutes} = \text{imageCount} \times \frac{12}{60}$$
$$\text{CodeAdjustmentMinutes} = \text{codeBlockCount} \times \frac{10}{60}$$
$$\text{TotalMinutes} = \max(1, \lceil \text{BaseMinutes} + \text{ImageAdjustmentMinutes} + \text{CodeAdjustmentMinutes} \rceil)$$

---

## 5. Paywall Enforcement Mechanism
When an article is designated `isMembersOnly: true`:
1. The backend inspects the requesting user's authorization token.
2. If unauthenticated or user does not possess an active `Membership` for the author/publication:
   - The article payload returns: `content: null`.
   - `excerpt` and a pre-computed `teaserHtml` (max 2 introductory paragraphs) are returned.
   - `isLocked: true` flag is set.
3. If user is an active member or the original author:
   - Full structured content and rendered HTML are returned.
   - `isLocked: false` flag is set.
*This guarantees that private content is never delivered over the wire to unauthorized clients.*
