# Database Schema (Planned)

## Enums
- `role`: `user` | `admin`
- `difficulty`: `easy` | `medium` | `hard`

## Tables

### `users`
- `id` (uuid, pk)
- `email` (text, unique, not null)
- `password_hash` (text, not null)
- `display_name` (text, not null)
- `role` (role, default `user`)
- `created_at` (timestamp, default now)

### `recipes`
- `id` (uuid, pk)
- `title` (text, not null)
- `description` (text)
- `difficulty` (difficulty, not null)
- `prep_minutes` (int)
- `cook_minutes` (int)
- `servings` (int)
- `author_id` (uuid, fk -> users.id)
- `is_published` (boolean, default true)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

### `recipe_ingredients`
- `id` (uuid, pk)
- `recipe_id` (uuid, fk -> recipes.id)
- `name` (text, not null)
- `quantity` (text)
- `sort_order` (int)

### `recipe_steps`
- `id` (uuid, pk)
- `recipe_id` (uuid, fk -> recipes.id)
- `instruction` (text, not null)
- `sort_order` (int)

### `recipe_tags`
- `id` (uuid, pk)
- `name` (text, unique, not null)

### `recipe_tag_map`
- `recipe_id` (uuid, fk -> recipes.id)
- `tag_id` (uuid, fk -> recipe_tags.id)
- **pk** (`recipe_id`, `tag_id`)

### `favorites`
- `user_id` (uuid, fk -> users.id)
- `recipe_id` (uuid, fk -> recipes.id)
- **pk** (`user_id`, `recipe_id`)

## Indexes (planned)
- `recipes(title)` for search
- `recipes(created_at)` for stable pagination and recent recipe lists
- `recipes(author_id)` for admin/user recipe ownership queries
- `recipe_tags(name)` unique
- `favorites(user_id)` for quick lookup
- `favorites(recipe_id)` for recipe popularity/count queries

## Seed Data (Planned)
- Add a committed seed script that inserts representative users, recipes, ingredients, steps, tags, tag mappings, and favorites.
- Include enough human-readable sample data for demos and review.
- Populate primary tables with at least 10,000 records for scalability and performance validation before final delivery.

## Pagination and Scalability (Planned)
- Recipe and admin list queries should support pagination before they are backed by large datasets.
- Prefer indexed sort/filter fields for large lists.
- Keep Drizzle migrations committed whenever schema or index changes are introduced.

## Notes
Schema will be refined as the revised web, mobile, auth, admin, seed, and pagination requirements are implemented.
