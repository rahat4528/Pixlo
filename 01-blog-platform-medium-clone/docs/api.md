# Blog Platform (Medium Clone) — API Specification

Base URL: `/api/v1`

All responses follow standard JSON envelope conventions:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "meta": {}
}
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user and author profile.
- **Request Body**:
  ```json
  {
    "email": "author@pixlo.local",
    "password": "SecurePassword123!",
    "displayName": "Alex Mercer",
    "username": "alexmercer"
  }
  ```
- **Response `201`**: User details, tokens (`accessToken`, `refreshToken`).

### `POST /auth/login`
Authenticates existing author or reader.
- **Request Body**:
  ```json
  {
    "email": "author@pixlo.local",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200`**: Tokens and profile info.

### `POST /auth/refresh`
Refreshes expired access token using valid refresh token.

---

## 2. Author Profile Endpoints

### `GET /authors/:username`
Public author profile including stats (published count, followers).

### `PUT /authors/profile` (Auth Required)
Update display name, biography, avatar URL, social links.

### `POST /authors/:username/follow` (Auth Required)
Follow an author.

### `DELETE /authors/:username/follow` (Auth Required)
Unfollow an author.

---

## 3. Article Management Endpoints

### `GET /articles`
Public article discovery and filtering.
- **Query Params**: `page`, `limit`, `tag`, `category`, `author`, `sort` (`latest`, `top`, `trending`).

### `GET /articles/feed` (Auth Required)
Personalized feed scored based on author follows, reading history, and tag affinity.

### `GET /articles/:slug`
Fetch published article by slug.
- If `isMembersOnly: true` and caller is not a member, `content` is masked and only `teaserHtml` is delivered.

### `POST /articles` (Auth Required)
Create a new article draft.
- **Request Body**:
  ```json
  {
    "title": "Designing Scalable Systems",
    "excerpt": "A deep dive into distributed architectures",
    "content": { "type": "doc", "content": [...] },
    "coverImageUrl": "https://pixlo.local/media/hero.jpg",
    "categoryId": "cat-tech-1",
    "tagNames": ["architecture", "scaling", "typescript"],
    "publicationId": null,
    "isMembersOnly": false
  }
  ```

### `PUT /articles/:id` (Auth Required: Author or Publication Editor)
Update draft or article metadata. Automatically creates a new `ArticleRevision`.

### `POST /articles/:id/transition` (Auth Required)
Execute a state machine transition.
- **Request Body**:
  ```json
  {
    "targetStatus": "SUBMITTED | IN_REVIEW | CHANGES_REQUESTED | APPROVED | SCHEDULED | PUBLISHED | UNPUBLISHED",
    "scheduledAt": "2026-12-01T10:00:00Z",
    "reviewNotes": "Please add more code examples in section 2"
  }
  ```

### `GET /articles/:id/revisions` (Auth Required)
List historical revisions of an article.

### `POST /articles/:id/revisions/:version/restore` (Auth Required)
Restore article to a historical version.

---

## 4. Publications & Editorial Workflows

### `POST /publications` (Auth Required)
Create a new multi-author publication.

### `POST /publications/:id/members` (Auth Required: Owner/Editor)
Invite/add a writer or editor (`role: WRITER | EDITOR`).

### `GET /publications/:id/submissions` (Auth Required: Owner/Editor)
List articles submitted for review.

### `POST /publications/:id/submissions/:articleId/review` (Auth Required: Owner/Editor)
Submit an editorial review verdict (`APPROVED` or `CHANGES_REQUESTED`).

---

## 5. Engagement & Interactivity

### `POST /articles/:id/reactions` (Auth Required)
Add or update reactions (e.g. `count` for applause, up to 50 max per user).

### `GET /articles/:id/comments`
List comments and nested replies.

### `POST /articles/:id/comments` (Auth Required)
Post a new comment or reply (with `parentId`). Content is sanitized before storage.

### `DELETE /comments/:id` (Auth Required: Author or Moderation Editor)
Moderate or delete comment.

### `POST /articles/:id/bookmark` (Auth Required)
Save article to reading bookmarks.

### `POST /articles/:id/analytics/view`
Record deduplicated article view session, time spent, and scroll depth.

---

## 6. Syndication & SEO

### `GET /sitemap.xml`
Dynamic XML sitemap indexing all published articles.

### `GET /rss/author/:username`
RSS 2.0 feed for an author's articles.

### `GET /rss/publication/:slug`
RSS 2.0 feed for a publication's articles.
