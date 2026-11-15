# Recipe Sharing Platform — Pixlo

A production-grade culinary community application featuring exact rational ingredient scaling, interactive cook mode with screen wake lock, weekly meal planning, and dimension-safe grocery list compilation. Built with Next.js, NestJS, TypeScript, PostgreSQL, and Redis.

---

## 1. Overview & Purpose
The Recipe Sharing Platform treats recipes as precision structured data rather than generic prose blog posts. It models ingredients with exact rational fractions (e.g., $1\ 1/2$ tsp), standardized unit dimensions (`MASS`, `VOLUME`, `COUNT`, `ARBITRARY`), and cooking execution steps. The platform enables home cooks and professional chefs to dynamically scale recipe servings with exact mathematical fractions, cook hands-free on countertop tablets, plan weekly meals, and compile consolidated grocery lists with zero dimension conflicts.

---

## 2. Feature Matrix

- **Identity & Cook Profiles**:
  - Secure authentication with bcrypt password hashing and JWT access/refresh token rotation.
  - Public cook profiles (`/cook/:username`) showcasing culinary specialties, experience levels, and authored recipes.
- **Precision Recipe Management**:
  - Structured ingredient composition with exact numerator/denominator integer pairs.
  - Unit Dimensions: `MASS` (`g`, `kg`, `oz`, `lb`), `VOLUME` (`tsp`, `tbsp`, `cup`, `ml`, `l`), `COUNT` (`piece`, `clove`), and `ARBITRARY` (`to taste`, `as needed`).
  - Cooking execution steps with instruction text, optional photography, and step timers.
  - Classification taxonomies: Cuisines (Italian, French, East Asian, Mediterranean), Course Categories (Mains, Pasta & Noodles, Breads & Pastry), and Dietary Tags (Gluten-Free, Vegetarian, Nut-Free).
- **Exact Rational Scaling Engine**:
  - Dynamically recalculates ingredient amounts for any custom serving count using exact rational arithmetic:
    $$\text{ScaledNumerator} = \text{amountNumerator} \times S_{\text{target}}$$
    $$\text{ScaledDenominator} = \text{amountDenominator} \times S_{\text{base}}$$
  - Renders natural culinary fractions ($1/2$, $3/4$, $1\ 1/2$, $2\ 1/4$) without lossy floating-point errors.
  - Protects non-scalable items (e.g., salt "to taste") from multiplication.
- **Interactive Countertop Cook Mode**:
  - High-contrast, large-typography step-by-step navigation designed for tablet countertop cooking.
  - Integrates the browser Screen Wake Lock API (`navigator.wakeLock`) to keep displays active during food preparation.
- **Pantry Search ("What's In Your Kitchen?")**:
  - Ranks recipes based on the percentage of available pantry ingredients matched, indicating missing ingredients.
- **Weekly Meal Planner**:
  - 7-day calendar grid mapping recipes to breakfast, lunch, dinner, and snack slots.
- **Dimension-Safe Shopping List Compilation**:
  - Consolidates ingredients across all scheduled meals in a weekly plan.
  - Merges items ONLY within identical unit dimensions; preserves separate lines for conflicting dimensions (e.g. 200g flour vs 1 cup flour).
  - Interactive grocery checklist with persistent strikethrough completion.
- **Community Ratings & Reviews**:
  - 1–5 star ratings and written reviews. Database unique constraint strictly enforces one rating per cook per recipe.
- **SEO & Schema.org Structured Data**:
  - Injects Schema.org `Recipe` JSON-LD structured data into public recipe pages.

---

## 3. Architecture & Tech Stack

```
02-recipe-sharing-platform/
  ├── frontend/              # Next.js 14 App Router, Tailwind CSS, Lucide Icons
  ├── backend/               # NestJS 10, TypeScript, Prisma ORM, JWT, class-validator
  ├── database/              # PostgreSQL schema, migrations, and seed scripts
  ├── tests/                 # Unit, scaling, shopping list, and E2E integration test suites
  ├── docs/                  # Requirements, API specs, architecture, completion report
  ├── docker-compose.yml     # PostgreSQL (5432), Redis (6382), MinIO (9003/9004)
  ├── .env.example
  └── README.md
```

### Technology Choices
- **Next.js & React**: Delivers server-rendered public recipe pages for search indexing and instantaneous client-side rational fraction recalculation.
- **NestJS & TypeScript**: Modular backend architecture (Auth, Recipes, Reviews, MealPlans, ShoppingLists) with strict DTO validation.
- **PostgreSQL & Prisma**: Relational integrity with unique rating constraints and composite keys for recipe ingredients.
- **Redis**: Caching popular recipes and ingredient taxonomy lookups.

---

## 4. Database Structure (`pixlo_recipes_db`)

- `User`: Identity, credentials, and role (`COOK`, `CREATOR`, `ADMIN`).
- `CookProfile`: Culinary specialties, experience level, and bio.
- `Cuisine` & `RecipeCategory`: Classification taxonomies.
- `DietaryTag` & `RecipeTag`: Dietary filters.
- `Ingredient`: Canonical ingredient library with synonym mappings.
- `Recipe`: Core recipe metadata, prep/cook times, base servings, difficulty, and ratings.
- `RecipeIngredient`: Structured ingredient with exact rational numerator/denominator and unit dimension.
- `CookingStep`: Ordered step instructions with timer markers.
- `RecipeRating`: Unique user rating (1–5).
- `RecipeReview`: Written review with author feedback.
- `MealPlan` & `MealPlanEntry`: Weekly scheduled meal calendar.
- `ShoppingList` & `ShoppingListItem`: Consolidated grocery checklists.

---

## 5. Local Setup & Installation

### Step 1: Start Backing Services
```bash
docker compose up -d
```
Starts PostgreSQL on port `5432`, Redis on `6382`, and MinIO on `9003/9004`.

### Step 2: Configure Environment
```bash
cp .env.example .env
```

### Step 3: Setup Backend & Database
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```
Backend API will run on `http://localhost:4002/api/v1`.
OpenAPI documentation is available at `http://localhost:4002/api/docs`.

### Step 4: Setup & Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend application will run on `http://localhost:3002`.

---

## 6. Seed Demo Accounts

| Account Role | Email | Password | Details |
|---|---|---|---|
| **Chef Antonio** | `antonio.rossi@pixlo.local` | `ChefPass123!` | Master Roman Pasta Artisan (`@chef_antonio`) |
| **Chef Mei** | `mei.lin@pixlo.local` | `ChefPass123!` | Sourdough & Pastry Baker (`@chef_mei`) |
| **Cook Leo** | `leo.davis@pixlo.local` | `CookPass123!` | Enthusiastic Home Cook (`@leo_cooks`) |
| **Cook Maya** | `maya.patel@pixlo.local` | `CookPass123!` | Vegetarian Home Cook (`@maya_eats`) |

---

## 7. Testing & Verification

Run all unit, scaling, shopping list consolidation, rating uniqueness, and E2E integration test suites:
```bash
cd backend
npm test
```

Run scaling-specific tests:
```bash
npm run test:scaling
```
