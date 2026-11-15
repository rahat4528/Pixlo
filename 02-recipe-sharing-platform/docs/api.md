# Recipe Sharing Platform — API Specification

Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates user and cook profile.

### `POST /auth/login`
Authenticates user, returns JWT access and refresh tokens.

---

## 2. Recipe Endpoints

### `GET /recipes`
Filter and discover recipes.
- **Query Params**: `page`, `limit`, `cuisine`, `category`, `dietaryTag`, `difficulty`, `maxTotalTime`, `sort` (`popular`, `rating`, `newest`).

### `GET /recipes/search-by-ingredients`
Ingredient-based discovery.
- **Query Params**: `ingredients` (comma-separated list of ingredients).
- Returns recipes ranked by match percentage, indicating which ingredients the user has and which are missing.

### `GET /recipes/:slug`
Fetch full recipe details including structured ingredients, instructions, average rating, creator info, and Schema.org Recipe structured data.
- **Query Param**: `servings` (optional integer to receive pre-scaled ingredients with exact rational display strings).

### `POST /recipes` (Auth Required: Creator)
Create a new structured recipe.

### `PUT /recipes/:id` (Auth Required: Creator)
Update recipe instructions, ingredients, or metadata.

---

## 3. Ratings & Reviews

### `POST /recipes/:id/ratings` (Auth Required)
Submit or update 1–5 star rating. Enforces one rating per user per recipe.

### `GET /recipes/:id/reviews`
List reviews with author details and ratings.

### `POST /recipes/:id/reviews` (Auth Required)
Submit written review with rating.

---

## 4. Shopping Lists & Meal Planning

### `POST /meal-plans` (Auth Required)
Create or update weekly meal plan entries.

### `GET /meal-plans/current` (Auth Required)
Get active weekly meal planning calendar grid.

### `POST /meal-plans/generate-shopping-list` (Auth Required)
Compiles all scheduled meals for the week into an aggregated, dimension-safe shopping list.

### `GET /shopping-lists` (Auth Required)
List user shopping lists with item completion statuses.

### `PATCH /shopping-lists/items/:itemId/toggle` (Auth Required)
Toggle checked/completed status of an ingredient.
