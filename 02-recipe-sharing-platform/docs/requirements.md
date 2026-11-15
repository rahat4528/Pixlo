# Recipe Sharing Platform — Requirements Specification

## 1. Domain Purpose
The Recipe Sharing Platform is a culinary community platform engineered specifically for structured recipe composition, dynamic serving scaling via rational arithmetic, interactive cook mode, weekly meal planning, and dimension-safe shopping list compilation.

It is distinct from generic article blogs: ingredients, quantities, units, dimensions, and execution steps are first-class structured domain entities.

---

## 2. Functional Requirements

### 2.1 Identity & Cook Profiles
- **Authentication**: Registration and login with bcrypt password hashing and JWT authentication.
- **Cook Profiles**: Display name, avatar, bio, culinary specialties (e.g., Artisan Baking, Fermentation, Pasta Craft), social links, follower/following counts.
- **Creator Following**: Social following of culinary creators.

### 2.2 Structured Recipe Management
- **Recipe Definition**:
  - Title, description, cover image, step images.
  - Prep time, cook time, total time (minutes).
  - Base serving size (integer > 0).
  - Difficulty: `EASY`, `MEDIUM`, `HARD`, `EXPERT`.
  - Cuisine: `Italian`, `French`, `Japanese`, `Mexican`, `Mediterranean`, `Thai`, etc.
  - Course Category: `Appetizers`, `Mains`, `Breads & Pastry`, `Desserts`, `Soups`.
  - Dietary Tags: `Gluten-Free`, `Vegan`, `Vegetarian`, `Dairy-Free`, `Nut-Free`, `Keto`.
- **Structured Ingredients**:
  - Stored as exact rational numbers (numerator and denominator) or exact decimals, never lossy binary floating-point numbers.
  - Standardized units with explicit Unit Dimensions:
    - `MASS`: `g`, `kg`, `oz`, `lb`
    - `VOLUME`: `ml`, `l`, `tsp`, `tbsp`, `cup`, `fl_oz`
    - `COUNT`: `piece`, `clove`, `pinch`, `can`, `slice`
    - `UNITLESS / ARBITRARY`: `to taste`, `as needed`, `pinch` (non-scalable or marked unscaled).
  - Ingredient normalization with canonical naming and synonym resolution.
- **Cooking Steps**:
  - Ordered sequential instructions with optional step photography and timing markers.
  - Interactive checkbox completion state that persists in client storage during execution.

### 2.3 Ingredient Scaling Engine
- **Serving Multiplier**: Scaling ratio $R = \frac{\text{targetServings}}{\text{baseServings}}$.
- **Exact Rational Arithmetic**:
  $$\text{ScaledQuantity} = \text{baseQuantity} \times R$$
  Preserves author's exact unit.
- **Natural Fraction Formatting**: Quantities render naturally: $1/2$, $1/4$, $1\ 1/2$, $2\ 3/4$, never clumsy binary float artifacts like $0.333333333$.
- **Non-scalable Exclusion**: Items designated as `to taste` or `as needed` never scale numerically.

### 2.4 Dimension-Safe Shopping List Compilation
- **Dimension Matching Rule**: Aggregation merges identical normalized ingredients ONLY if they belong to the same unit dimension.
  - Two volume ingredients (e.g. 1 tbsp olive oil + 2 tbsp olive oil) merge into 3 tbsp olive oil (or promoted to 1/4 cup when documented thresholds match).
  - Mass and volume items for the same ingredient (e.g., 200g flour + 1 cup flour) are strictly kept on separate lines unless a documented ingredient density lookup exists.
- **Checklist**: Mark items as purchased; persists in user session.

### 2.5 Weekly Meal Planning Grid
- Weekly calendar grid (Monday–Sunday) mapping recipes to `Breakfast`, `Lunch`, `Dinner`, `Snack`.
- "Generate Shopping List from Week": Compiles all ingredients from scheduled recipes into a dimension-safe shopping list.

### 2.6 Cook Mode & Screen Wake Lock
- Focused distraction-free view designed for countertop tablet/mobile use.
- Large legible typography, high-contrast step cards, built-in step timers.
- Integrates the browser Screen Wake Lock API (`navigator.wakeLock.request('screen')`) to keep the display active while cooking.

### 2.7 Community, Ratings & Reviews
- **Ratings & Reviews**: 1–5 star ratings with optional written review. Exactly one rating per user per recipe (unique constraint enforced in database).
- **Favorites & Collections**: Custom recipe collections (e.g. "Weeknight Dinners", "Holiday Baking").
- **Reporting & Moderation**: Abusive reviews or comments can be flagged and moderated.

### 2.8 SEO & Structured Data
- Schema.org `Recipe` JSON-LD structured data on all public recipe pages (`name`, `prepTime`, `cookTime`, `recipeYield`, `recipeIngredient`, `recipeInstructions`, `aggregateRating`).
