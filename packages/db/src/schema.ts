import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "easy",
  "medium",
  "hard"
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email)
  })
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug)
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    slugIdx: index("tags_slug_idx").on(table.slug)
  })
);

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    prepTimeMinutes: integer("prep_time_minutes"),
    cookTimeMinutes: integer("cook_time_minutes"),
    servings: integer("servings"),
    difficulty: difficultyLevelEnum("difficulty").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    slugIdx: index("recipes_slug_idx").on(table.slug),
    categoryIdx: index("recipes_category_id_idx").on(table.categoryId),
    authorIdx: index("recipes_author_id_idx").on(table.authorId)
  })
);

export const recipeSteps = pgTable(
  "recipe_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id),
    stepNumber: integer("step_number").notNull(),
    instruction: text("instruction").notNull()
  },
  (table) => ({
    recipeIdx: index("recipe_steps_recipe_id_idx").on(table.recipeId)
  })
);

export const recipeTags = pgTable(
  "recipe_tags",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id)
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recipeId, table.tagId] }),
    tagIdx: index("recipe_tags_tag_id_idx").on(table.tagId)
  })
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id)
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.recipeId] }),
    recipeIdx: index("favorites_recipe_id_idx").on(table.recipeId)
  })
);
