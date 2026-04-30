# API Endpoints (Planned)

Base path: `/api`

## Auth
- `POST /auth/register` — create account
- `POST /auth/login` — issue JWT
- `POST /auth/refresh` — refresh access token
- `POST /auth/logout` — revoke refresh token

## Recipes (public)
- `GET /recipes` — list recipes (filters: `q`, `tag`, `difficulty`, `page`, `pageSize`)
- `GET /recipes/:id` — recipe details

## Favorites (user)
- `GET /me/favorites` — list user favorites
- `POST /me/favorites` — add favorite
- `DELETE /me/favorites/:recipeId` — remove favorite

## Admin recipes (admin)
- `POST /admin/recipes` — create recipe
- `PUT /admin/recipes/:id` — update recipe
- `DELETE /admin/recipes/:id` — delete recipe
- `POST /admin/recipes/:id/publish` — publish/unpublish

## Response conventions
- Success: `{ data, meta? }`
- Errors: `{ error: { code, message, details? } }`

## Auth rules
- Public endpoints require no auth
- `/me/*` requires user JWT
- `/admin/*` requires admin role
