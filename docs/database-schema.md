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
- `recipe_tags(name)` unique
- `favorites(user_id)` for quick lookup

## Notes
Schema will be refined once UI requirements are finalized.
