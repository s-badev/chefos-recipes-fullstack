import { pathToFileURL } from "node:url";

import { sql } from "drizzle-orm";
import type { AnyPgTable } from "drizzle-orm/pg-core";

import { createDbClient, getDatabaseUrl, type DbClient } from "./client.js";
import {
  categories as categoriesTable,
  favorites as favoritesTable,
  recipeSteps as recipeStepsTable,
  recipeTags as recipeTagsTable,
  recipes as recipesTable,
  tags as tagsTable,
  users as usersTable
} from "./schema.js";

export const LARGE_RECIPE_COUNT = 10000;
export const DEFAULT_BATCH_SIZE = 500;

export type SeedUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
};

export type SeedCategory = {
  id: string;
  name: string;
  slug: string;
};

export type SeedTag = {
  id: string;
  name: string;
  slug: string;
};

export type SeedRecipe = {
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

export type SeedRecipeStep = {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
};

export type SeedRecipeTag = {
  recipeId: string;
  tagId: string;
};

export type SeedFavorite = {
  userId: string;
  recipeId: string;
};

export type SeedData = {
  users: SeedUser[];
  categories: SeedCategory[];
  tags: SeedTag[];
  recipes: SeedRecipe[];
  recipeSteps: SeedRecipeStep[];
  recipeTags: SeedRecipeTag[];
  favorites: SeedFavorite[];
};

export type LargeSeedOptions = {
  recipeCount?: number;
};

export type SeedLogger = Pick<Console, "error" | "log">;

export type SeedDatabaseOptions = {
  batchSize?: number;
  data?: SeedData;
  dryRun?: boolean;
  env?: NodeJS.ProcessEnv;
  logger?: SeedLogger;
  recipeCount?: number;
};

export type SeedTableResult = {
  batches: number;
  inserted: number;
  skipped: number;
  total: number;
};

export type SeedDatabaseResult = {
  batchSize: number;
  counts: Record<keyof SeedData, number>;
  insertionOrder: ReturnType<typeof getSeedInsertionPlan>;
  mode: "dry-run" | "insert";
  recipeCount: number;
  tables: Record<keyof SeedData, SeedTableResult>;
};

const DIFFICULTIES: SeedRecipe["difficulty"][] = ["easy", "medium", "hard"];

const titleStyles = [
  { name: "Домашна", slug: "homemade" },
  { name: "Селска", slug: "village" },
  { name: "Печена", slug: "baked" },
  { name: "Бърза", slug: "quick" },
  { name: "Постна", slug: "lean" },
  { name: "Празнична", slug: "festive" },
  { name: "Лятна", slug: "summer" },
  { name: "Зимна", slug: "winter" },
  { name: "Класическа", slug: "classic" },
  { name: "Семейна", slug: "family" }
] as const;

const recipeBases = [
  { name: "мусака", slug: "moussaka", categorySlug: "main-dishes" },
  { name: "баница", slug: "banitsa", categorySlug: "pastry" },
  { name: "шопска салата", slug: "shopska-salad", categorySlug: "salads" },
  { name: "супа топчета", slug: "meatball-soup", categorySlug: "soups" },
  { name: "каварма", slug: "kavarma", categorySlug: "main-dishes" },
  { name: "пълнени чушки", slug: "stuffed-peppers", categorySlug: "main-dishes" },
  { name: "картофена яхния", slug: "potato-stew", categorySlug: "stews" },
  { name: "тиквеник", slug: "tikvenik", categorySlug: "desserts" },
  { name: "кюфтета", slug: "meatballs", categorySlug: "grill" },
  { name: "таратор", slug: "tarator", categorySlug: "soups" },
  { name: "ориз с гъби", slug: "rice-with-mushrooms", categorySlug: "vegetarian" },
  { name: "пилешка яхния", slug: "chicken-stew", categorySlug: "stews" },
  { name: "свинско с праз", slug: "pork-with-leek", categorySlug: "main-dishes" },
  { name: "крем карамел", slug: "creme-caramel", categorySlug: "desserts" },
  { name: "риба на фурна", slug: "baked-fish", categorySlug: "fish" },
  { name: "омлет със сирене", slug: "sirene-omelette", categorySlug: "breakfast" }
] as const;

const ingredientVariations = [
  { text: "с домати и пресен магданоз", slug: "tomato-parsley" },
  { text: "с печени чушки и чесън", slug: "pepper-garlic" },
  { text: "с бяло сирене и кисело мляко", slug: "sirene-yogurt" },
  { text: "с картофи и чубрица", slug: "potato-savory" },
  { text: "с гъби и лук", slug: "mushroom-onion" },
  { text: "с моркови и целина", slug: "carrot-celery" },
  { text: "с ориз и пресни подправки", slug: "rice-herbs" },
  { text: "с тиквички и копър", slug: "zucchini-dill" },
  { text: "с пилешко и червен пипер", slug: "chicken-paprika" },
  { text: "с праз и доматен сос", slug: "leek-tomato" },
  { text: "с мед и орехи", slug: "honey-walnut" },
  { text: "с лимон и зехтин", slug: "lemon-olive-oil" }
] as const;

const servingMoments = [
  "делнична вечеря",
  "неделен обяд",
  "семейна трапеза",
  "гости у дома",
  "лек обяд",
  "празнично меню",
  "бързо хапване",
  "уютна зимна вечер"
] as const;

const cookingNotes = [
  "с балансиран вкус и ясни стъпки",
  "с познати продукти и домашен аромат",
  "с кратка подготовка и надежден резултат",
  "с умерени подправки и плътна текстура",
  "с традиционен профил и практично изпълнение",
  "с достъпни продукти и стабилно време за готвене"
] as const;

const stepOpeners = [
  "Подготви продуктите и ги нарежи равномерно.",
  "Измий и подсуши основните продукти преди готвене.",
  "Подреди продуктите близо до котлона, за да работиш спокойно.",
  "Загрей съда и подготви мазнината на умерена температура."
] as const;

const stepMiddles = [
  "Сготви основата на умерен огън, докато ароматите се смесят.",
  "Добави подправките постепенно и разбърквай, за да не загорят.",
  "Остави сместа да къкри, докато продуктите омекнат.",
  "Разпредели плънката или соса равномерно преди финалното готвене."
] as const;

const stepClosers = [
  "Опитай на сол и сервирай ястието топло.",
  "Остави ястието да почине няколко минути преди сервиране.",
  "Поръси с пресни подправки и поднеси веднага.",
  "Сервирай с кисело мляко, салата или хляб според сезона."
] as const;

function createSeedUuid(prefix: string, sequence: number) {
  return `${prefix}-0000-4000-8000-${sequence.toString().padStart(12, "0")}`;
}

function pickByIndex<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

function buildSeedCategories(): SeedCategory[] {
  return [
    { id: createSeedUuid("10000000", 1), name: "Салати", slug: "salads" },
    { id: createSeedUuid("10000000", 2), name: "Основни", slug: "main-dishes" },
    { id: createSeedUuid("10000000", 3), name: "Тестени", slug: "pastry" },
    { id: createSeedUuid("10000000", 4), name: "Супи", slug: "soups" },
    { id: createSeedUuid("10000000", 5), name: "Яхнии", slug: "stews" },
    { id: createSeedUuid("10000000", 6), name: "Десерти", slug: "desserts" },
    { id: createSeedUuid("10000000", 7), name: "Скара", slug: "grill" },
    { id: createSeedUuid("10000000", 8), name: "Постни", slug: "vegetarian" },
    { id: createSeedUuid("10000000", 9), name: "Риба", slug: "fish" },
    { id: createSeedUuid("10000000", 10), name: "Закуска", slug: "breakfast" }
  ];
}

function buildSeedTags(): SeedTag[] {
  return [
    { id: createSeedUuid("20000000", 1), name: "Свежо", slug: "fresh" },
    { id: createSeedUuid("20000000", 2), name: "Домашно", slug: "homemade" },
    { id: createSeedUuid("20000000", 3), name: "С печене", slug: "baked" },
    { id: createSeedUuid("20000000", 4), name: "Бързо", slug: "quick" },
    { id: createSeedUuid("20000000", 5), name: "Постно", slug: "lean" },
    { id: createSeedUuid("20000000", 6), name: "С месо", slug: "with-meat" },
    { id: createSeedUuid("20000000", 7), name: "Сирене", slug: "sirene" },
    { id: createSeedUuid("20000000", 8), name: "Зеленчуци", slug: "vegetables" },
    { id: createSeedUuid("20000000", 9), name: "Празнично", slug: "festive" },
    { id: createSeedUuid("20000000", 10), name: "За деца", slug: "kids" },
    { id: createSeedUuid("20000000", 11), name: "Икономично", slug: "budget" },
    { id: createSeedUuid("20000000", 12), name: "Традиционно", slug: "traditional" }
  ];
}

function findCategoryId(categories: SeedCategory[], slug: string) {
  return categories.find((category) => category.slug === slug)?.id ?? categories[0].id;
}

export function chunkSeedRows<T>(rows: T[], batchSize = DEFAULT_BATCH_SIZE) {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error("Seed batch size must be a positive integer.");
  }

  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += batchSize) {
    chunks.push(rows.slice(index, index + batchSize));
  }

  return chunks;
}

function getSeedCounts(data: SeedData): Record<keyof SeedData, number> {
  return {
    users: data.users.length,
    categories: data.categories.length,
    tags: data.tags.length,
    recipes: data.recipes.length,
    recipeSteps: data.recipeSteps.length,
    recipeTags: data.recipeTags.length,
    favorites: data.favorites.length
  };
}

function getDryRunTableResult<T>(rows: T[], batchSize: number): SeedTableResult {
  return {
    batches: chunkSeedRows(rows, batchSize).length,
    inserted: 0,
    skipped: 0,
    total: rows.length
  };
}

function getDryRunTableResults(
  data: SeedData,
  batchSize: number
): Record<keyof SeedData, SeedTableResult> {
  return {
    users: getDryRunTableResult(data.users, batchSize),
    categories: getDryRunTableResult(data.categories, batchSize),
    tags: getDryRunTableResult(data.tags, batchSize),
    recipes: getDryRunTableResult(data.recipes, batchSize),
    recipeSteps: getDryRunTableResult(data.recipeSteps, batchSize),
    recipeTags: getDryRunTableResult(data.recipeTags, batchSize),
    favorites: getDryRunTableResult(data.favorites, batchSize)
  };
}

function isDryRunEnabled(value: string | undefined) {
  return value?.toLowerCase() === "true" || value === "1";
}

function logDryRunTable(logger: SeedLogger, label: string, result: SeedTableResult) {
  logger.log(
    `[seed] ${label}: generated ${result.total}, planned batches ${result.batches}, inserted/skipped 0/0 (dry run)`
  );
}

function logInsertedTable(logger: SeedLogger, label: string, result: SeedTableResult) {
  logger.log(
    `[seed] ${label}: inserted ${result.inserted}, skipped ${result.skipped}, batches ${result.batches}`
  );
}

type InsertableRow<TTable extends AnyPgTable> = TTable["$inferInsert"];

async function insertBatched<TTable extends AnyPgTable>(
  db: DbClient,
  table: TTable,
  rows: InsertableRow<TTable>[],
  batchSize: number
): Promise<SeedTableResult> {
  const batches = chunkSeedRows(rows, batchSize);
  let inserted = 0;

  for (const batch of batches) {
    const insertedRows = await db
      .insert(table)
      .values(batch)
      .onConflictDoNothing()
      .returning({ inserted: sql<number>`1` });

    inserted += insertedRows.length;
  }

  return {
    batches: batches.length,
    inserted,
    skipped: rows.length - inserted,
    total: rows.length
  };
}

export function generateLargeSeedUsers(): SeedUser[] {
  return [...seedUsers];
}

export function generateLargeSeedCategories(): SeedCategory[] {
  return buildSeedCategories();
}

export function generateLargeSeedTags(): SeedTag[] {
  return buildSeedTags();
}

export function generateLargeSeedRecipes(
  recipeCount = LARGE_RECIPE_COUNT,
  categories = generateLargeSeedCategories(),
  users = generateLargeSeedUsers()
): SeedRecipe[] {
  if (!Number.isInteger(recipeCount) || recipeCount < 0) {
    throw new Error("Seed recipe count must be a non-negative integer.");
  }

  return Array.from({ length: recipeCount }, (_, index) => {
    const sequence = index + 1;
    const style = pickByIndex(titleStyles, index);
    const base = pickByIndex(recipeBases, index * 3);
    const ingredient = pickByIndex(ingredientVariations, index * 5);
    const moment = pickByIndex(servingMoments, index * 7);
    const note = pickByIndex(cookingNotes, index * 11);
    const title = `${base.name} ${ingredient.text} - ${style.name.toLowerCase()} версия`;

    return {
      id: createSeedUuid("30000000", sequence),
      title,
      slug: `${base.slug}-${style.slug}-${ingredient.slug}-${sequence.toString().padStart(5, "0")}`,
      description: `${title} - рецепта ${note}, подходяща за ${moment}. Записът е част от детерминиран набор за тест на каталог с много рецепти.`,
      prepTimeMinutes: 10 + ((index * 7) % 45),
      cookTimeMinutes: base.categorySlug === "salads" ? 0 : 15 + ((index * 13) % 95),
      servings: 2 + (index % 7),
      difficulty: pickByIndex(DIFFICULTIES, index),
      categoryId: findCategoryId(categories, base.categorySlug),
      authorId: users[index % users.length].id
    };
  });
}

export function generateLargeSeedRecipeSteps(recipes: SeedRecipe[]): SeedRecipeStep[] {
  return recipes.flatMap((recipe, recipeIndex) => {
    const baseStepSequence = recipeIndex * 3;

    return [
      {
        id: createSeedUuid("40000000", baseStepSequence + 1),
        recipeId: recipe.id,
        stepNumber: 1,
        instruction: pickByIndex(stepOpeners, recipeIndex)
      },
      {
        id: createSeedUuid("40000000", baseStepSequence + 2),
        recipeId: recipe.id,
        stepNumber: 2,
        instruction: pickByIndex(stepMiddles, recipeIndex * 2)
      },
      {
        id: createSeedUuid("40000000", baseStepSequence + 3),
        recipeId: recipe.id,
        stepNumber: 3,
        instruction: pickByIndex(stepClosers, recipeIndex * 3)
      }
    ];
  });
}

export function generateLargeSeedRecipeTags(
  recipes: SeedRecipe[],
  tags = generateLargeSeedTags()
): SeedRecipeTag[] {
  return recipes.flatMap((recipe, recipeIndex) => {
    const tagIndexes = new Set([
      recipeIndex % tags.length,
      (recipeIndex + 3) % tags.length,
      (recipeIndex + 7) % tags.length
    ]);

    return Array.from(tagIndexes, (tagIndex) => ({
      recipeId: recipe.id,
      tagId: tags[tagIndex].id
    }));
  });
}

export function generateLargeSeedFavorites(
  recipes: SeedRecipe[],
  users = generateLargeSeedUsers()
): SeedFavorite[] {
  const demoUsers = users.filter((user) => user.role === "user");

  return demoUsers.flatMap((user, userIndex) => {
    const favorites: SeedFavorite[] = [];
    const step = 37 + userIndex * 11;
    const offset = userIndex * 13;

    for (let recipeIndex = offset; recipeIndex < recipes.length; recipeIndex += step) {
      favorites.push({
        userId: user.id,
        recipeId: recipes[recipeIndex].id
      });
    }

    return favorites;
  });
}

export function generateLargeSeedData(options: LargeSeedOptions = {}): SeedData {
  const recipeCount = options.recipeCount ?? LARGE_RECIPE_COUNT;
  const users = generateLargeSeedUsers();
  const categories = generateLargeSeedCategories();
  const tags = generateLargeSeedTags();
  const recipes = generateLargeSeedRecipes(recipeCount, categories, users);

  return {
    users,
    categories,
    tags,
    recipes,
    recipeSteps: generateLargeSeedRecipeSteps(recipes),
    recipeTags: generateLargeSeedRecipeTags(recipes, tags),
    favorites: generateLargeSeedFavorites(recipes, users)
  };
}

export const seedUsers: SeedUser[] = [
  {
    id: createSeedUuid("00000000", 1),
    name: "Demo Admin",
    email: "admin@example.com",
    // Placeholder only. bcrypt or argon2 hashing will be added with the real auth implementation.
    passwordHash: "placeholder-hash-for-demo-admin",
    role: "admin"
  },
  {
    id: createSeedUuid("00000000", 2),
    name: "Demo User",
    email: "user@example.com",
    // Placeholder only. Never seed real plaintext passwords or reusable credentials.
    passwordHash: "placeholder-hash-for-demo-user",
    role: "user"
  }
];

export const seedCategories: SeedCategory[] = buildSeedCategories().slice(0, 3);

export const seedTags: SeedTag[] = buildSeedTags().slice(0, 3);

export const seedRecipes: SeedRecipe[] = [
  {
    id: createSeedUuid("30000000", 1),
    title: "Шопска салата",
    slug: "shopska-salad",
    description:
      "Свежа класика с домати, краставици, печени чушки, магданоз и настъргано сирене.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: "easy",
    categoryId: seedCategories[0].id,
    authorId: seedUsers[0].id
  },
  {
    id: createSeedUuid("30000000", 2),
    title: "Баница със сирене",
    slug: "banitsa-with-sirene",
    description:
      "Фини кори с яйца, кисело мляко и бяло сирене, изпечени до златиста коричка.",
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "medium",
    categoryId: seedCategories[2].id,
    authorId: seedUsers[0].id
  },
  {
    id: createSeedUuid("30000000", 3),
    title: "Кавърма със свинско",
    slug: "kavarma-pork-stew",
    description:
      "Крехко свинско с чушки, гъби, домати, вино и чубрица за уютна вечеря.",
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
    id: createSeedUuid("40000000", 1),
    recipeId: seedRecipes[0].id,
    stepNumber: 1,
    instruction: "Нарежи зеленчуците и ги смеси в купа."
  },
  {
    id: createSeedUuid("40000000", 2),
    recipeId: seedRecipes[0].id,
    stepNumber: 2,
    instruction: "Овкуси и настържи сиренето отгоре."
  },
  {
    id: createSeedUuid("40000000", 3),
    recipeId: seedRecipes[1].id,
    stepNumber: 1,
    instruction: "Приготви плънка от яйца, кисело мляко и сирене."
  },
  {
    id: createSeedUuid("40000000", 4),
    recipeId: seedRecipes[1].id,
    stepNumber: 2,
    instruction: "Редувай кори и плънка, после изпечи до златисто."
  },
  {
    id: createSeedUuid("40000000", 5),
    recipeId: seedRecipes[2].id,
    stepNumber: 1,
    instruction: "Запечати месото и добави зеленчуците."
  },
  {
    id: createSeedUuid("40000000", 6),
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

export const seedData: SeedData = {
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

export async function seedDatabase(options: SeedDatabaseOptions = {}): Promise<SeedDatabaseResult> {
  const env = options.env ?? process.env;
  const logger = options.logger ?? console;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const dryRun = options.dryRun ?? isDryRunEnabled(env.SEED_DRY_RUN);
  const databaseUrl = dryRun ? undefined : getDatabaseUrl(env);
  const data =
    options.data ??
    generateLargeSeedData({ recipeCount: options.recipeCount ?? LARGE_RECIPE_COUNT });
  const insertionOrder = getSeedInsertionPlan();
  const counts = getSeedCounts(data);
  const recipeCount = data.recipes.length;

  logger.log(
    `[seed] started (${dryRun ? "dry run" : "insert"}, recipes ${recipeCount}, batch size ${batchSize})`
  );

  if (dryRun) {
    const tables = getDryRunTableResults(data, batchSize);

    logDryRunTable(logger, "users", tables.users);
    logDryRunTable(logger, "categories", tables.categories);
    logDryRunTable(logger, "tags", tables.tags);
    logDryRunTable(logger, "recipes", tables.recipes);
    logDryRunTable(logger, "recipe steps", tables.recipeSteps);
    logDryRunTable(logger, "recipe tag relations", tables.recipeTags);
    logDryRunTable(logger, "favorite relations", tables.favorites);
    logger.log("[seed] completed (dry run, no database connection opened)");

    return {
      batchSize,
      counts,
      insertionOrder,
      mode: "dry-run",
      recipeCount,
      tables
    };
  }

  const db = createDbClient(databaseUrl);

  // Password hashes remain placeholders until the authentication scope adds bcrypt or argon2.
  // The insert path is explicit and idempotent: stable IDs/slugs/emails plus ON CONFLICT DO NOTHING.
  const usersResult = await insertBatched(db, usersTable, data.users, batchSize);
  logInsertedTable(logger, "users", usersResult);

  const categoriesResult = await insertBatched(
    db,
    categoriesTable,
    data.categories,
    batchSize
  );
  logInsertedTable(logger, "categories", categoriesResult);

  const tagsResult = await insertBatched(db, tagsTable, data.tags, batchSize);
  logInsertedTable(logger, "tags", tagsResult);

  const recipesResult = await insertBatched(db, recipesTable, data.recipes, batchSize);
  logInsertedTable(logger, "recipes", recipesResult);

  const recipeStepsResult = await insertBatched(
    db,
    recipeStepsTable,
    data.recipeSteps,
    batchSize
  );
  logInsertedTable(logger, "recipe steps", recipeStepsResult);

  const recipeTagsResult = await insertBatched(
    db,
    recipeTagsTable,
    data.recipeTags,
    batchSize
  );
  logInsertedTable(logger, "recipe tag relations", recipeTagsResult);

  const favoritesResult = await insertBatched(
    db,
    favoritesTable,
    data.favorites,
    batchSize
  );
  logInsertedTable(logger, "favorite relations", favoritesResult);
  logger.log("[seed] completed");

  return {
    batchSize,
    counts,
    insertionOrder,
    mode: "insert",
    recipeCount,
    tables: {
      users: usersResult,
      categories: categoriesResult,
      tags: tagsResult,
      recipes: recipesResult,
      recipeSteps: recipeStepsResult,
      recipeTags: recipeTagsResult,
      favorites: favoritesResult
    }
  };
}

export function planLargeDatasetSeed(
  targetRecipeCount = LARGE_RECIPE_COUNT,
  batchSize = DEFAULT_BATCH_SIZE
) {
  const generatedData = generateLargeSeedData({ recipeCount: targetRecipeCount });

  // Planning helper only: seedDatabase() uses the same deterministic data and batch sizes
  // for real Drizzle inserts when DATABASE_URL is explicitly provided.
  return {
    targetRecipeCount,
    batchSize,
    status: "planned",
    mode: "dry-run",
    insertionOrder: getSeedInsertionPlan(),
    counts: {
      users: generatedData.users.length,
      categories: generatedData.categories.length,
      tags: generatedData.tags.length,
      recipes: generatedData.recipes.length,
      recipeSteps: generatedData.recipeSteps.length,
      recipeTags: generatedData.recipeTags.length,
      favorites: generatedData.favorites.length
    },
    batchCounts: {
      users: chunkSeedRows(generatedData.users, batchSize).length,
      categories: chunkSeedRows(generatedData.categories, batchSize).length,
      tags: chunkSeedRows(generatedData.tags, batchSize).length,
      recipes: chunkSeedRows(generatedData.recipes, batchSize).length,
      recipeSteps: chunkSeedRows(generatedData.recipeSteps, batchSize).length,
      recipeTags: chunkSeedRows(generatedData.recipeTags, batchSize).length,
      favorites: chunkSeedRows(generatedData.favorites, batchSize).length
    }
  };
}

function isDirectSeedExecution() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href);
}

if (isDirectSeedExecution()) {
  seedDatabase().catch((error: unknown) => {
    console.error("[seed] failed");
    console.error(error);
    process.exitCode = 1;
  });
}
