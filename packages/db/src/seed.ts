type SeedUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
};

type SeedCategory = {
  id: string;
  name: string;
  slug: string;
};

type SeedTag = {
  id: string;
  name: string;
  slug: string;
};

type SeedRecipe = {
  id: string;
  title: string;
  slug: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  categoryId: string;
  authorId: string;
};

type SeedRecipeStep = {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
};

type SeedRecipeTag = {
  recipeId: string;
  tagId: string;
};

type SeedFavorite = {
  userId: string;
  recipeId: string;
};

export const seedUsers: SeedUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Demo Admin",
    email: "admin@example.com",
    // Placeholder only. bcrypt or argon2 hashing will be added with the real auth implementation.
    passwordHash: "placeholder-hash-for-demo-admin",
    role: "admin"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Demo User",
    email: "user@example.com",
    // Placeholder only. Never seed real plaintext passwords or reusable credentials.
    passwordHash: "placeholder-hash-for-demo-user",
    role: "user"
  }
];

export const seedCategories: SeedCategory[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Салати",
    slug: "salads"
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Основни",
    slug: "main-dishes"
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Тестени",
    slug: "pastry"
  }
];

export const seedTags: SeedTag[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Свежо",
    slug: "fresh"
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Домашно",
    slug: "homemade"
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "С печене",
    slug: "baked"
  }
];

export const seedRecipes: SeedRecipe[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    title: "Шопска салата",
    slug: "shopska-salad",
    description: "Свежа класика с домати, краставици, печени чушки, магданоз и настъргано сирене.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: "easy",
    categoryId: seedCategories[0].id,
    authorId: seedUsers[0].id
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    title: "Баница със сирене",
    slug: "banitsa-with-sirene",
    description: "Фини кори с яйца, кисело мляко и бяло сирене, изпечени до златиста коричка.",
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "medium",
    categoryId: seedCategories[2].id,
    authorId: seedUsers[0].id
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    title: "Кавърма със свинско",
    slug: "kavarma-pork-stew",
    description: "Крехко свинско с чушки, гъби, домати, вино и чубрица за уютна вечеря.",
    prepTimeMinutes: 25,
    cookTimeMinutes: 75,
    servings: 4,
    difficulty: "medium",
    categoryId: seedCategories[1].id,
    authorId: seedUsers[0].id
  }
];

export const seedRecipeSteps: SeedRecipeStep[] = [
  {
    id: "40000000-0000-4000-8000-000000000001",
    recipeId: seedRecipes[0].id,
    stepNumber: 1,
    instruction: "Нарежи зеленчуците и ги смеси в купа."
  },
  {
    id: "40000000-0000-4000-8000-000000000002",
    recipeId: seedRecipes[0].id,
    stepNumber: 2,
    instruction: "Овкуси и настържи сиренето отгоре."
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    recipeId: seedRecipes[1].id,
    stepNumber: 1,
    instruction: "Приготви плънка от яйца, кисело мляко и сирене."
  },
  {
    id: "40000000-0000-4000-8000-000000000004",
    recipeId: seedRecipes[1].id,
    stepNumber: 2,
    instruction: "Редувай кори и плънка, после изпечи до златисто."
  },
  {
    id: "40000000-0000-4000-8000-000000000005",
    recipeId: seedRecipes[2].id,
    stepNumber: 1,
    instruction: "Запечати месото и добави зеленчуците."
  },
  {
    id: "40000000-0000-4000-8000-000000000006",
    recipeId: seedRecipes[2].id,
    stepNumber: 2,
    instruction: "Добави домати, вино и подправки, после остави да къкри."
  }
];

export const seedRecipeTags: SeedRecipeTag[] = [
  {
    recipeId: seedRecipes[0].id,
    tagId: seedTags[0].id
  },
  {
    recipeId: seedRecipes[1].id,
    tagId: seedTags[2].id
  },
  {
    recipeId: seedRecipes[2].id,
    tagId: seedTags[1].id
  }
];

export const seedFavorites: SeedFavorite[] = [
  {
    userId: seedUsers[1].id,
    recipeId: seedRecipes[0].id
  },
  {
    userId: seedUsers[1].id,
    recipeId: seedRecipes[1].id
  }
];

export const seedData = {
  users: seedUsers,
  categories: seedCategories,
  tags: seedTags,
  recipes: seedRecipes,
  recipeSteps: seedRecipeSteps,
  recipeTags: seedRecipeTags,
  favorites: seedFavorites
};

export function getSeedInsertionPlan() {
  return [
    "users",
    "categories",
    "tags",
    "recipes",
    "recipe_steps",
    "recipe_tags",
    "favorites"
  ];
}

export async function seedDatabase() {
  const insertionOrder = getSeedInsertionPlan();

  // Safety: this foundation intentionally does not import the DB client or call db.insert().
  // When Neon is wired, add an explicit executable path that hashes demo passwords first,
  // opens a Drizzle client, and inserts data in the order returned above.
  return {
    mode: "dry-run",
    insertionOrder,
    counts: {
      users: seedUsers.length,
      categories: seedCategories.length,
      tags: seedTags.length,
      recipes: seedRecipes.length,
      recipeSteps: seedRecipeSteps.length,
      recipeTags: seedRecipeTags.length,
      favorites: seedFavorites.length
    }
  };
}

export function planLargeDatasetSeed(targetRecipeCount = 10000) {
  // Future scalability seed:
  // 1. Generate deterministic category/tag pools.
  // 2. Generate targetRecipeCount recipe rows in batches.
  // 3. Generate related steps and tag mappings per recipe.
  // 4. Insert with Drizzle batch/chunk logic after Neon is explicitly configured.
  return {
    targetRecipeCount,
    status: "planned"
  };
}
