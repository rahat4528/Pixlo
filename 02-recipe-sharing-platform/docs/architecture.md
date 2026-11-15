# Recipe Sharing Platform — Architecture Blueprint

## 1. System Overview
The Recipe Sharing Platform comprises:
- **Frontend**: Next.js 14 application with responsive culinary discovery, warm visual identity, interactive recipe page with instant fraction scaling, Cook Mode with Wake Lock, Meal Planner grid, and shopping list builder.
- **Backend**: NestJS application exposing RESTful endpoints, rational arithmetic scaling algorithms, ingredient normalization, dimension-safe shopping list compilation, and review management.
- **Persistence**: Dedicated PostgreSQL database (`pixlo_recipes_db`) with Prisma ORM.
- **Cache**: Redis for recipe ranking and trending cache.
- **Storage**: S3-compatible / local storage for food photography.

---

## 2. Domain Data Model

```
User (1) ---- (1) CookProfile
User (1) ---- (N) Recipe (as Creator)
User (1) ---- (N) RecipeRating
User (1) ---- (N) RecipeReview
User (1) ---- (N) SavedRecipe
User (1) ---- (N) RecipeCollection ---- (N) RecipeCollectionItem
User (1) ---- (N) MealPlan ---- (N) MealPlanEntry
User (1) ---- (N) ShoppingList ---- (N) ShoppingListItem

Recipe (1) ---- (N) RecipeIngredient ---- (1) Ingredient
Recipe (1) ---- (N) CookingStep
Recipe (1) ---- (N) RecipeImage
Recipe (1) ---- (N) RecipeRating
Recipe (1) ---- (N) RecipeReview
Recipe (N) ---- (1) Cuisine
Recipe (N) ---- (1) RecipeCategory
Recipe (1) ---- (N) RecipeTag ---- (1) DietaryTag
```

### Key Entities & Relations

1. **User**: `id`, `email`, `passwordHash`, `role` (USER, CREATOR, ADMIN), `createdAt`.
2. **CookProfile**: `id`, `userId`, `username`, `displayName`, `bio`, `avatarUrl`, `specialties` (string[]), `experienceLevel`.
3. **Recipe**:
   - `id`, `creatorId`, `title`, `slug`, `description`, `coverImageUrl`
   - `prepTimeMinutes`, `cookTimeMinutes`, `totalTimeMinutes`, `servings`
   - `difficulty` (EASY, MEDIUM, HARD, EXPERT), `cuisineId`, `categoryId`
   - `averageRating`, `ratingsCount`, `viewCount`, `isPublished`, `createdAt`
4. **Ingredient**: `id`, `canonicalName`, `category` (Produce, Dairy, Meat, Pantry, Baking, Spices).
5. **RecipeIngredient**:
   - `id`, `recipeId`, `ingredientId`, `rawLine`, `amountNumerator`, `amountDenominator` (exact rational)
   - `unit`, `unitDimension` (MASS, VOLUME, COUNT, ARBITRARY), `notes`, `isScalable`, `orderIndex`
6. **CookingStep**: `id`, `recipeId`, `stepNumber`, `instruction`, `timerMinutes`, `imageUrl`.
7. **RecipeRating**: `id`, `recipeId`, `userId`, `rating` (1–5 integer). Unique constraint on `[recipeId, userId]`.
8. **RecipeReview**: `id`, `recipeId`, `userId`, `content`, `rating`, `createdAt`.
9. **MealPlan**: `id`, `userId`, `weekStartDate`, `createdAt`.
10. **MealPlanEntry**: `id`, `mealPlanId`, `recipeId`, `dayOfWeek` (0–6), `mealType` (BREAKFAST, LUNCH, DINNER, SNACK).
11. **ShoppingList**: `id`, `userId`, `title`, `createdAt`.
12. **ShoppingListItem**: `id`, `shoppingListId`, `ingredientName`, `amountNumerator`, `amountDenominator`, `unit`, `unitDimension`, `isCompleted`.

---

## 3. Scaling & Rational Arithmetic Architecture

All recipe ingredients store amounts as integer pairs:
$$\text{amount} = \frac{\text{amountNumerator}}{\text{amountDenominator}}$$
Example: $1\ 1/2$ cups is stored as $\frac{3}{2}$ cups.

When scaled from base servings $S_{\text{base}}$ to target servings $S_{\text{target}}$:
$$\text{ScaledNumerator} = \text{amountNumerator} \times S_{\text{target}}$$
$$\text{ScaledDenominator} = \text{amountDenominator} \times S_{\text{base}}$$
The fraction is simplified by computing the greatest common divisor $\gcd(\text{ScaledNumerator}, \text{ScaledDenominator})$.

### Fraction Rendering
- If denominator is 1, render integer (e.g., `2`).
- If numerator < denominator, render simple fraction (e.g., `1/2`, `3/4`).
- If numerator > denominator, render mixed number (e.g., $5/2 = 2\ 1/2$).
- Common fractional symbols: $1/2$, $1/3$, $2/3$, $1/4$, $3/4$, $1/8$.

---

## 4. Shopping List Dimension-Safe Merging Rules

When consolidating ingredients from multiple recipes:
1. Normalize ingredient names (e.g., "all-purpose flour" and "AP flour" resolve to "All-Purpose Flour").
2. Check unit dimensions:
   - If both are `VOLUME` (e.g., `tbsp` and `tsp`), convert to base `ml`, sum, and promote to readable unit (`tsp`, `tbsp`, `cup`).
   - If both are `MASS` (e.g., `g` and `kg`), convert to base `g`, sum, and promote to `kg` if $\ge 1000\text{g}$.
   - If both are `COUNT` with identical units (e.g. 2 eggs + 3 eggs), sum to 5 eggs.
   - If unit dimensions conflict (e.g., 200g flour and 1 cup flour), **do NOT merge lossily without density data**; output both lines clearly so user accuracy is preserved.
