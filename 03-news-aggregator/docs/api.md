# Pixlo News Aggregator — REST API Specification

Base URL: `http://localhost:4003/api`  
Interactive Swagger Documentation: `http://localhost:4003/api/docs`

## 1. Authentication Endpoints

### 1.1 Register Reader
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**:
  ```json
  {
    "email": "reader@pixlo.news",
    "password": "SecurePassword123!",
    "displayName": "Jane Doe"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "reader@pixlo.news",
      "displayName": "Jane Doe",
      "role": "READER"
    },
    "accessToken": "jwt-token"
  }
  ```

### 1.2 Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**:
  ```json
  {
    "email": "reader@pixlo.news",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK`

### 1.3 Get Profile
- **Method**: `GET`
- **Path**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Publisher Sources Endpoints

### 2.1 List Registered Sources
- **Method**: `GET`
- **Path**: `/sources`
- **Query Parameters**:
  - `status`: Filter by `ACTIVE`, `SUSPENDED`, `ERROR`, `PAUSED`
  - `category`: Filter by category slug
- **Response**: `200 OK`

### 2.2 Get Source Details
- **Method**: `GET`
- **Path**: `/sources/:slug`
- **Response**: `200 OK` with recent articles and follow status

### 2.3 Create Publisher Source (Admin)
- **Method**: `POST`
- **Path**: `/sources`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Body**:
  ```json
  {
    "name": "Tech Horizon",
    "slug": "tech-horizon",
    "websiteUrl": "https://techhorizon.io",
    "feedUrl": "https://techhorizon.io/feed.xml",
    "category": "technology",
    "description": "Software architecture and semiconductors."
  }
  ```
- **Response**: `201 Created`

### 2.4 Toggle Follow Publisher
- **Method**: `POST`
- **Path**: `/sources/:id/follow`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` `{"followed": true}`

---

## 3. Articles Endpoints

### 3.1 List Articles
- **Method**: `GET`
- **Path**: `/articles`
- **Query Parameters**:
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 20)
  - `category`: Category slug
  - `sourceSlug`: Filter by publisher
  - `q`: Search keyword across title and excerpt
  - `isBreaking`: Boolean
- **Response**: `200 OK` with paginated `data` and `meta`

### 3.2 Get Trending Articles
- **Method**: `GET`
- **Path**: `/articles/trending`
- **Query Parameters**: `limit` (default: 6)
- **Response**: `200 OK`

### 3.3 Get Article Details
- **Method**: `GET`
- **Path**: `/articles/:id`
- **Response**: `200 OK` with originalUrl, canonicalUrl, and cluster siblings

### 3.4 Save Article Bookmark
- **Method**: `POST`
- **Path**: `/articles/:id/save`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"notes": "Reference for clean energy project"}`
- **Response**: `201 Created`

### 3.5 Remove Article Bookmark
- **Method**: `DELETE`
- **Path**: `/articles/:id/save`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 3.6 Log Reading Engagement
- **Method**: `POST`
- **Path**: `/articles/:id/read`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"durationSeconds": 95}`
- **Response**: `201 Created`

---

## 4. Story Clusters Endpoints

### 4.1 List Story Clusters
- **Method**: `GET`
- **Path**: `/clusters`
- **Query Parameters**: `category`, `isBreaking`, `limit`
- **Response**: `200 OK`

### 4.2 Get Cluster Detail
- **Method**: `GET`
- **Path**: `/clusters/:id`
- **Response**: `200 OK` with all grouped publisher articles

### 4.3 Trigger Reclustering Pass (Admin)
- **Method**: `POST`
- **Path**: `/clusters/recluster`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: `200 OK` `{"clustersCreated": 1, "articlesClustered": 2}`

---

## 5. Personalization Endpoints

### 5.1 Get Preferences
- **Method**: `GET`
- **Path**: `/personalization/preferences`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 5.2 Update Preferences
- **Method**: `PUT`
- **Path**: `/personalization/preferences`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "preferredCategories": ["technology", "science"],
    "preferredTopics": ["Artificial Intelligence", "Renewable Energy"],
    "breakingAlerts": true
  }
  ```
- **Response**: `200 OK`

### 5.3 Personalized Feed
- **Method**: `GET`
- **Path**: `/personalization/feed`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `limit` (default: 30)
- **Response**: `200 OK` with feed score annotations

---

## 6. Admin Ingestion Console Endpoints

### 6.1 List Ingestion Jobs
- **Method**: `GET`
- **Path**: `/ingestion/jobs`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Query Parameters**: `status`, `feedSourceId`
- **Response**: `200 OK`

### 6.2 List Ingestion Errors
- **Method**: `GET`
- **Path**: `/ingestion/errors`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Query Parameters**: `resolved` (boolean)
- **Response**: `200 OK`

### 6.3 Trigger Feed Ingest
- **Method**: `POST`
- **Path**: `/ingestion/feeds/:feedSourceId/trigger`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "jobId": "job-uuid",
    "itemsFound": 8,
    "itemsIngested": 2,
    "itemsDuplicated": 6,
    "isNotModified": false
  }
  ```

### 6.4 Retry Failed Job
- **Method**: `POST`
- **Path**: `/ingestion/errors/:errorId/retry`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: `200 OK`

### 6.5 Resume Suspended Source
- **Method**: `POST`
- **Path**: `/ingestion/sources/:sourceId/resume`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: `200 OK`
