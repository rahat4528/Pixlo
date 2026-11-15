import { PrismaClient, UserRole, RecipeDifficulty, UnitDimension, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedRecipesDatabase() {
  console.log('--- Starting Pixlo Recipe Sharing Platform Seeding ---');

  // Clear existing records in reverse dependency order
  await prisma.shoppingListItem.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.mealPlanEntry.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.recipeCollectionItem.deleteMany();
  await prisma.recipeCollection.deleteMany();
  await prisma.savedRecipe.deleteMany();
  await prisma.recipeReview.deleteMany();
  await prisma.recipeRating.deleteMany();
  await prisma.cookingStep.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipeImage.deleteMany();
  await prisma.recipeTag.deleteMany();
  await prisma.dietaryTag.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.recipeCategory.deleteMany();
  await prisma.cuisine.deleteMany();
  await prisma.cookProfile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const chefPass = await bcrypt.hash('ChefPass123!', saltRounds);
  const cookPass = await bcrypt.hash('CookPass123!', saltRounds);

  // 1. Create Users
  const chefAntonio = await prisma.user.create({
    data: {
      email: 'antonio.rossi@pixlo.local',
      passwordHash: chefPass,
      role: UserRole.CREATOR,
      profile: {
        create: {
          username: 'chef_antonio',
          displayName: 'Chef Antonio Rossi',
          bio: 'Third-generation Roman pasta artisan. Obsessed with traditional dough hydration, seasonal guanciale, and zero-compromise technique.',
          avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
          specialties: ['Artisan Pasta', 'Roman Sauces', 'Focaccia Baking'],
          experienceLevel: 'Professional Chef',
        },
      },
    },
    include: { profile: true },
  });

  const chefMei = await prisma.user.create({
    data: {
      email: 'mei.lin@pixlo.local',
      passwordHash: chefPass,
      role: UserRole.CREATOR,
      profile: {
        create: {
          username: 'chef_mei',
          displayName: 'Mei Lin',
          bio: 'Pastry chef and sourdough baker. Exploring long cold fermentations, whole grain milling, and delicate French viennoiserie.',
          avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80',
          specialties: ['Sourdough Bread', 'Viennoiserie', 'Fermentation'],
          experienceLevel: 'Artisan Baker',
        },
      },
    },
    include: { profile: true },
  });

  const cookLeo = await prisma.user.create({
    data: {
      email: 'leo.davis@pixlo.local',
      passwordHash: cookPass,
      role: UserRole.COOK,
      profile: {
        create: {
          username: 'leo_cooks',
          displayName: 'Leo Davis',
          bio: 'Passionate weeknight home cook learning bread making and fresh pasta.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          experienceLevel: 'Enthusiastic Home Cook',
        },
      },
    },
    include: { profile: true },
  });

  const cookMaya = await prisma.user.create({
    data: {
      email: 'maya.patel@pixlo.local',
      passwordHash: cookPass,
      role: UserRole.COOK,
      profile: {
        create: {
          username: 'maya_eats',
          displayName: 'Maya Patel',
          bio: 'Food lover, vegetarian enthusiast, and meal prep planner.',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          experienceLevel: 'Home Cook',
        },
      },
    },
    include: { profile: true },
  });

  // 2. Cuisines & Categories
  const cuisineItalian = await prisma.cuisine.create({ data: { name: 'Italian', slug: 'italian' } });
  const cuisineFrench = await prisma.cuisine.create({ data: { name: 'French', slug: 'french' } });
  const cuisineAsian = await prisma.cuisine.create({ data: { name: 'East Asian', slug: 'east-asian' } });

  const catMains = await prisma.recipeCategory.create({ data: { name: 'Mains', slug: 'mains' } });
  const catPasta = await prisma.recipeCategory.create({ data: { name: 'Pasta & Noodles', slug: 'pasta-noodles' } });
  const catBread = await prisma.recipeCategory.create({ data: { name: 'Breads & Pastry', slug: 'breads-pastry' } });

  const tagVegetarian = await prisma.dietaryTag.create({ data: { name: 'Vegetarian', slug: 'vegetarian' } });
  const tagNutFree = await prisma.dietaryTag.create({ data: { name: 'Nut-Free', slug: 'nut-free' } });

  // 3. Normalized Ingredients Library
  const ingRigatoni = await prisma.ingredient.create({
    data: { canonicalName: 'Rigatoni Pasta', category: 'Pantry', synonyms: ['rigatoni', 'tubular pasta'] },
  });
  const ingGuanciale = await prisma.ingredient.create({
    data: { canonicalName: 'Guanciale', category: 'Meat', synonyms: ['cured pork jowl'] },
  });
  const ingPecorino = await prisma.ingredient.create({
    data: { canonicalName: 'Pecorino Romano Cheese', category: 'Dairy', synonyms: ['pecorino', 'grated pecorino'] },
  });
  const ingEggYolks = await prisma.ingredient.create({
    data: { canonicalName: 'Fresh Egg Yolks', category: 'Dairy', synonyms: ['egg yolks', 'large egg yolks'] },
  });
  const ingBlackPepper = await prisma.ingredient.create({
    data: { canonicalName: 'Coarse Black Pepper', category: 'Spices', synonyms: ['black pepper', 'cracked black pepper'] },
  });

  const ingBreadFlour = await prisma.ingredient.create({
    data: { canonicalName: 'Bread Flour', category: 'Baking', synonyms: ['strong flour', 'high-protein flour'] },
  });
  const ingWater = await prisma.ingredient.create({
    data: { canonicalName: 'Water', category: 'Pantry' },
  });
  const ingSourdoughStarter = await prisma.ingredient.create({
    data: { canonicalName: 'Active Sourdough Starter', category: 'Baking', synonyms: ['levain', 'starter'] },
  });
  const ingSeaSalt = await prisma.ingredient.create({
    data: { canonicalName: 'Fine Sea Salt', category: 'Pantry', synonyms: ['salt', 'kosher salt'] },
  });

  // 4. Recipe 1: Roman Carbonara (Exact rational quantities)
  const recipeCarbonara = await prisma.recipe.create({
    data: {
      creatorId: chefAntonio.id,
      title: 'Authentic Roman Rigatoni alla Carbonara',
      slug: 'authentic-roman-rigatoni-alla-carbonara',
      description: 'The definitive Roman classic: crispy cured guanciale, tempered farm-fresh egg yolks, sharp Pecorino Romano, and toasted freshly cracked black pepper. No cream, no peas, zero compromise.',
      coverImageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      totalTimeMinutes: 30,
      servings: 4,
      difficulty: RecipeDifficulty.MEDIUM,
      cuisineId: cuisineItalian.id,
      categoryId: catPasta.id,
      averageRating: 4.9,
      ratingsCount: 38,
      viewCount: 1850,
      dietaryTags: {
        create: [{ tagId: tagNutFree.id }],
      },
      ingredients: {
        create: [
          {
            ingredientId: ingRigatoni.id,
            rawLine: '400g bronze-die extruded rigatoni pasta',
            amountNumerator: 400,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 0,
          },
          {
            ingredientId: ingGuanciale.id,
            rawLine: '200g cured guanciale, cut into 1/4-inch lardons',
            amountNumerator: 200,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 1,
          },
          {
            ingredientId: ingEggYolks.id,
            rawLine: '6 large fresh egg yolks at room temperature',
            amountNumerator: 6,
            amountDenominator: 1,
            unit: 'piece',
            unitDimension: UnitDimension.COUNT,
            orderIndex: 2,
          },
          {
            ingredientId: ingPecorino.id,
            rawLine: '100g finely grated Pecorino Romano DOP',
            amountNumerator: 100,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 3,
          },
          {
            ingredientId: ingBlackPepper.id,
            rawLine: '1 1/2 tsp freshly cracked tellicherry black pepper',
            amountNumerator: 3,
            amountDenominator: 2, // 1 1/2 = 3/2
            unit: 'tsp',
            unitDimension: UnitDimension.VOLUME,
            orderIndex: 4,
          },
        ],
      },
      steps: {
        create: [
          {
            stepNumber: 1,
            instruction: 'Place guanciale strips into a cold, dry skillet over medium-low heat. Slowly render the fat for 10-12 minutes until deeply golden and crisp on the exterior while remaining tender inside. Remove guanciale and reserve rendered fat.',
            timerMinutes: 12,
          },
          {
            stepNumber: 2,
            instruction: 'In a heat-proof mixing bowl, whisk room-temperature egg yolks, grated Pecorino Romano, and cracked black pepper into a thick paste (la carbocrema). Whisk in 2 tablespoons of rendered guanciale fat.',
            timerMinutes: 3,
          },
          {
            stepNumber: 3,
            instruction: 'Drop rigatoni into boiling, lightly salted water (use half the normal salt since guanciale and Pecorino are very savory). Cook 2 minutes short of package instructions until very al dente.',
            timerMinutes: 9,
          },
          {
            stepNumber: 4,
            instruction: 'Transfer pasta directly into the warm skillet off the heat. Pour the carbocrema paste over pasta along with 1/4 cup of starchy pasta water. Toss vigorously off the flame so the residual heat cooks the eggs into a glossy, silk-like emulsion without scrambling. Fold in crispy guanciale and serve immediately.',
            timerMinutes: 3,
          },
        ],
      },
    },
  });

  // 5. Recipe 2: Artisan Sourdough Boule
  const recipeSourdough = await prisma.recipe.create({
    data: {
      creatorId: chefMei.id,
      title: 'Artisan High-Hydration Country Sourdough Boule',
      slug: 'artisan-high-hydration-country-sourdough',
      description: 'Open, custardy crumb with blistered caramelized crust. Uses an overnight cold retard to develop lactic and acetic flavor complexity.',
      coverImageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=1200&q=80',
      prepTimeMinutes: 45,
      cookTimeMinutes: 45,
      totalTimeMinutes: 90,
      servings: 10,
      difficulty: RecipeDifficulty.HARD,
      cuisineId: cuisineFrench.id,
      categoryId: catBread.id,
      averageRating: 5.0,
      ratingsCount: 24,
      viewCount: 1420,
      dietaryTags: {
        create: [{ tagId: tagVegetarian.id }, { tagId: tagNutFree.id }],
      },
      ingredients: {
        create: [
          {
            ingredientId: ingBreadFlour.id,
            rawLine: '450g unbleached strong bread flour',
            amountNumerator: 450,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 0,
          },
          {
            ingredientId: ingWater.id,
            rawLine: '350g lukewarm water (78% hydration)',
            amountNumerator: 350,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 1,
          },
          {
            ingredientId: ingSourdoughStarter.id,
            rawLine: '100g active mature sourdough starter',
            amountNumerator: 100,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 2,
          },
          {
            ingredientId: ingSeaSalt.id,
            rawLine: '10g fine sea salt',
            amountNumerator: 10,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            orderIndex: 3,
          },
        ],
      },
      steps: {
        create: [
          {
            stepNumber: 1,
            instruction: 'Autolyse: Mix flour and 325g water in a large bowl until no dry flour remains. Cover and rest at 26°C for 60 minutes.',
            timerMinutes: 60,
          },
          {
            stepNumber: 2,
            instruction: 'Incorporate: Dimple active starter into dough and fold. Rest 30 minutes, then add salt dissolved in remaining 25g water.',
            timerMinutes: 30,
          },
          {
            stepNumber: 3,
            instruction: 'Bulk Fermentation: Perform 4 sets of stretch and folds spaced 30 minutes apart. Allow dough to rise until aerated and increased in volume by 40-50%.',
            timerMinutes: 120,
          },
          {
            stepNumber: 4,
            instruction: 'Bake: Preheat Dutch oven to 240°C (465°F). Score dough with razor blade. Bake covered for 25 minutes with steam, then uncovered for 20 minutes until deeply mahogany.',
            timerMinutes: 45,
          },
        ],
      },
    },
  });

  // 6. Community Ratings & Reviews
  await prisma.recipeRating.createMany({
    data: [
      { recipeId: recipeCarbonara.id, userId: cookLeo.id, rating: 5 },
      { recipeId: recipeCarbonara.id, userId: cookMaya.id, rating: 5 },
      { recipeId: recipeSourdough.id, userId: cookLeo.id, rating: 5 },
    ],
  });

  await prisma.recipeReview.create({
    data: {
      recipeId: recipeCarbonara.id,
      userId: cookLeo.id,
      rating: 5,
      content: 'This recipe permanently replaced all other carbonara attempts in our home! Taking the pan off the heat before adding the carbocrema is the secret.',
    },
  });

  // 7. Meal Plan & Shopping List for Leo
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: cookLeo.id,
      weekStartDate: weekStart,
      entries: {
        create: [
          { recipeId: recipeCarbonara.id, dayOfWeek: 2, mealType: MealType.DINNER }, // Tuesday Dinner
          { recipeId: recipeSourdough.id, dayOfWeek: 6, mealType: MealType.BREAKFAST }, // Saturday Breakfast
        ],
      },
    },
  });

  const shoppingList = await prisma.shoppingList.create({
    data: {
      userId: cookLeo.id,
      title: 'Leo’s Weekly Cooking Ingredients',
      items: {
        create: [
          {
            ingredientName: 'Rigatoni Pasta',
            amountNumerator: 400,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            isCompleted: false,
          },
          {
            ingredientName: 'Guanciale',
            amountNumerator: 200,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            isCompleted: true, // Already checked in grocery store
          },
          {
            ingredientName: 'Pecorino Romano Cheese',
            amountNumerator: 100,
            amountDenominator: 1,
            unit: 'g',
            unitDimension: UnitDimension.MASS,
            isCompleted: false,
          },
          {
            ingredientName: 'Fresh Egg Yolks',
            amountNumerator: 6,
            amountDenominator: 1,
            unit: 'piece',
            unitDimension: UnitDimension.COUNT,
            isCompleted: false,
          },
        ],
      },
    },
  });

  console.log('--- Seed Finished Successfully for Recipe Platform ---');
  console.log('Demo Accounts:');
  console.log('  Chef Antonio: antonio.rossi@pixlo.local / ChefPass123!');
  console.log('  Chef Mei:     mei.lin@pixlo.local / ChefPass123!');
  console.log('  Cook Leo:     leo.davis@pixlo.local / CookPass123!');
  console.log('  Cook Maya:    maya.patel@pixlo.local / CookPass123!');
}

if (require.main === module) {
  seedRecipesDatabase()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
