# Database Schema

Chefo's Recipes uses Drizzle ORM with Neon PostgreSQL. Schema definitions live in `packages/db/src/schema.ts`, and migrations live in `packages/db/drizzle`.

## Enums

| Enum | Values |
|---|---|
| `user_role` | `user`, `admin` |
| `difficulty_level` | `easy`, `medium`, `hard` |

## Tables

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Required |
| `email` | text | Required, unique |
| `password_hash` | text | Required |
| `role` | `user_role` | Defaults to `user` |
| `created_at` | timestamp | Defaults to now |
| `updated_at` | timestamp | Defaults to now |

### `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Required |
| `slug` | text | Required, unique |
| `created_at` | timestamp | Defaults to now |

### `tags`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Required |
| `slug` | text | Required, unique |
| `created_at` | timestamp | Defaults to now |

### `recipes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `title` | text | Required |
| `slug` | text | Required, unique |
| `description` | text | Optional |
| `image_url` | text | Optional |
| `image_alt` | text | Optional |
| `prep_time_minutes` | integer | Optional |
| `cook_time_minutes` | integer | Optional |
| `servings` | integer | Optional |
| `difficulty` | `difficulty_level` | Required |
| `category_id` | uuid | FK to `categories.id` |
| `author_id` | uuid | FK to `users.id` |
| `created_at` | timestamp | Defaults to now |
| `updated_at` | timestamp | Defaults to now |

### `recipe_steps`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `recipe_id` | uuid | FK to `recipes.id` |
| `step_number` | integer | Required |
| `instruction` | text | Required |

### `recipe_tags`

| Column | Type | Notes |
|---|---|---|
| `recipe_id` | uuid | FK to `recipes.id` |
| `tag_id` | uuid | FK to `tags.id` |

Composite primary key: `recipe_id`, `tag_id`.

### `favorites`

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to `users.id` |
| `recipe_id` | uuid | FK to `recipes.id` |

Composite primary key: `user_id`, `recipe_id`.

## Relationships

- One user can author many recipes.
- One category can contain many recipes.
- One recipe can have many ordered recipe steps.
- Recipes and tags have a many-to-many relationship through `recipe_tags`.
- Users and recipes have a many-to-many favorites relationship through `favorites`.

## Indexes

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

Composite primary keys also support lookups by their leading columns.

## Seed Strategy

The seed logic in `packages/db/src/seed.ts` supports capstone scalability testing.

Key constants:

- `LARGE_RECIPE_COUNT = 10000`
- Default batch size: 500 rows

Generated seed data includes:

- users
- categories
- tags
- recipes
- recipe steps
- recipe-tag relations
- favorites

The seed process supports dry-run planning through `SEED_DRY_RUN=true` and only opens a database connection when real inserts are requested.

## Auth Data Note

The database schema includes `password_hash` for real account storage. The current web demo login uses app-level demo users with salted `scrypt` password hashes to provide stable evaluator credentials without exposing plaintext passwords to the client.
