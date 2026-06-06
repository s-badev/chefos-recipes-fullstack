# API Endpoints

Base path: `/api`

This document lists only API routes currently present under `apps/web/src/app/api`.

## Summary

| Endpoint | Methods | Access | Purpose |
|---|---|---|---|
| `/api/health` | `GET` | Public | Health check |
| `/api/recipes` | `GET` | Public | Paginated recipe list |
| `/api/recipes` | `POST` | Admin | Create recipe |
| `/api/recipes/[slug]` | `GET` | Public | Recipe details |
| `/api/recipes/[slug]` | `PATCH`, `PUT` | Admin | Update recipe |
| `/api/recipes/[slug]` | `DELETE` | Admin | Delete recipe |
| `/api/categories` | `GET` | Public | Category list/counts |
| `/api/favorites` | `GET` | User/Admin | Favorites data |
| `/api/admin/summary` | `GET` | Admin | Admin statistics |

There are no `/api/auth/*` route files in the current implementation. Login/logout are handled by Server Actions and a signed httpOnly cookie session.

## `GET /api/health`

Returns basic API health information.

## `GET /api/recipes`

Returns a paginated recipe list.

Supported query parameters:

| Parameter | Purpose |
|---|---|
| `page` | Optional page number |
| `pageSize` | Optional page size |

Response shape includes:

- `items`
- `data`
- `total`
- `page`
- `pageSize`
- `totalPages`
- `meta`

## `POST /api/recipes`

Creates a recipe. Requires an authenticated admin session.

Accepts form data or JSON values matching the admin recipe form:

- `title`
- `category`
- `description`
- `prepTime`
- `cookTime`
- `servings`

Non-admin requests receive `403`. Guest requests receive `401`.

## `GET /api/recipes/[slug]`

Returns one recipe by slug. Returns `404` when the slug does not exist.

## `PATCH /api/recipes/[slug]` and `PUT /api/recipes/[slug]`

Updates a recipe. Requires an authenticated admin session.

Accepts the same recipe form fields as creation.

## `DELETE /api/recipes/[slug]`

Deletes a recipe by slug. Requires an authenticated admin session.

The repository removes related favorites, recipe-tag relations, and recipe steps before deleting the recipe record.

## `GET /api/categories`

Returns categories and recipe counts from the database-backed service.

## `GET /api/favorites`

Returns database-backed favorite recipe data for the authenticated user flow. Requires a logged-in user or admin session.

Guest requests receive `401`.

## `GET /api/admin/summary`

Returns admin summary data:

- total recipes
- total categories
- total tags
- total users

Requires an authenticated admin session. Non-admin requests receive `403`; guest requests receive `401`.

## Auth Notes

- Browser login uses a Server Action.
- Logout uses a Server Action.
- Session state is stored in a signed httpOnly cookie.
- Mobile API login/register use JWTs signed with `MOBILE_JWT_SECRET`.
- API mutation handlers independently check role access on the server.
