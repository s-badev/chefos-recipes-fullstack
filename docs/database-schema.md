# Database Schema And Seed Strategy

This document describes the current Drizzle schema direction, the large seed dataset strategy, and planned indexing work. It is documentation only; schema and index changes must still be committed through Drizzle migrations when finalized.

## Enums

- `user_role`: `user` | `admin`
- `difficulty_level`: `easy` | `medium` | `hard`

## Tables

### `users`

- `id` (uuid, pk)
- `name` (text, not null)
- `email` (text, unique, not null)
- `password_hash` (text, not null)
- `role` (`user_role`, default `user`)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

Password hashes in seed data are placeholders for now. Real password hashing with bcrypt or argon2 will be implemented with authentication.

### `categories`

- `id` (uuid, pk)
- `name` (text, not null)
- `slug` (text, unique, not null)
- `created_at` (timestamp, default now)

### `tags`

- `id` (uuid, pk)
- `name` (text, not null)
- `slug` (text, unique, not null)
- `created_at` (timestamp, default now)

### `recipes`

- `id` (uuid, pk)
- `title` (text, not null)
- `slug` (text, unique, not null)
- `description` (text)
- `image_url` (text)
- `image_alt` (text)
- `prep_time_minutes` (int)
- `cook_time_minutes` (int)
- `servings` (int)
- `difficulty` (`difficulty_level`, not null)
- `category_id` (uuid, fk -> categories.id)
- `author_id` (uuid, fk -> users.id)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

### `recipe_steps`

- `id` (uuid, pk)
- `recipe_id` (uuid, fk -> recipes.id)
- `step_number` (int, not null)
- `instruction` (text, not null)

### `recipe_tags`

- `recipe_id` (uuid, fk -> recipes.id)
- `tag_id` (uuid, fk -> tags.id)
- **pk** (`recipe_id`, `tag_id`)

### `favorites`

- `user_id` (uuid, fk -> users.id)
- `recipe_id` (uuid, fk -> recipes.id)
- **pk** (`user_id`, `recipe_id`)

## Seed Data

The `packages/db` seed foundation supports the revised SoftUni capstone requirement for scalability testing with at least 10,000 records.

- `LARGE_RECIPE_COUNT = 10000`
- `DEFAULT_BATCH_SIZE = 500`
- deterministic generated Bulgarian recipe titles and descriptions
- small demo user set
- generated categories, tags, recipes, recipe steps, recipe-tag relations and favorites
- stable UUIDs, slugs and emails to make repeated runs predictable
- `onConflictDoNothing()` behavior for idempotent inserts when the seed is run against a configured database

The seed script should only connect when `DATABASE_URL` is provided from the local environment. No real credentials should ever be committed. `SEED_DRY_RUN=true` generates and summarizes the dataset without opening a database connection or inserting rows.

## Batching Strategy

Large seed inserts are split into batches of 500 rows by default. The seed order follows table relationships:

1. `users`
2. `categories`
3. `tags`
4. `recipes`
5. `recipe_steps`
6. `recipe_tags`
7. `favorites`

This order allows foreign keys to resolve while keeping insert batches small enough for review and operational safety.

## Pagination And Scalability

Recipe list endpoints and catalog UI should keep using pagination for large datasets. The 10,000-record seed dataset is intended to validate that list views do not require loading every recipe at once.

Large list queries should prefer stable indexed sort and filter fields, especially `created_at`, `slug`, `category_id`, and relation table keys.

## Indexes

Current and planned indexes should be reviewed against real query patterns before additional migrations are created.

Current schema indexes include:

- `users.email`
- `categories.slug`
- `tags.slug`
- `recipes.slug`
- `recipes.category_id`
- `recipes.author_id`
- `recipe_steps.recipe_id`
- `recipe_tags.tag_id`
- `favorites.recipe_id`

Planned indexing strategy:

- `recipes.slug` for recipe detail lookup by slug
- `recipes.category_id` for category-filtered catalog pages
- `recipes.created_at` for stable pagination and recent recipe ordering
- `recipe_tags.recipe_id` for recipe detail tag lookup, already covered by the composite primary key prefix
- `recipe_tags.tag_id` for tag-filtered recipe lookup
- `favorites.user_id` for a user's favorites list, already covered by the composite primary key prefix
- `favorites.recipe_id` for favorite counts and recipe-level relation lookups

When finalized, any new or changed indexes must be added through Drizzle schema updates and committed migrations.
