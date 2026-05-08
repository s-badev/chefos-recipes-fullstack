# API Endpoints

Base path: `/api`

The current API routes are an initial Next.js route-handler skeleton. They return static/sample data
only and are not connected to Neon, Drizzle, authentication, JWTs, or real user sessions yet.

## Implemented Placeholder Routes

| Method | Path | Purpose | Current response behavior |
|---|---|---|---|
| `GET` | `/api/health` | Basic health check for the web app API. | Returns `status`, app name, and a generated timestamp. |
| `GET` | `/api/recipes` | Public recipe list endpoint. | Returns the current static sample recipe list from the web app. |
| `GET` | `/api/recipes/[slug]` | Public recipe details endpoint by slug. | Returns one static sample recipe when found; returns `404` when the slug does not exist. |
| `GET` | `/api/categories` | Public category list endpoint. | Returns categories derived from the static sample recipe data, including recipe counts. |
| `GET` | `/api/favorites` | Placeholder favorites endpoint. | Returns a small static list of sample favorite recipes and a message that real favorites will be profile-based later. |
| `GET` | `/api/admin/summary` | Placeholder admin dashboard summary endpoint. | Returns static summary counts for recipes, categories, and tags. |

## Current Response Shape

Most placeholder endpoints use a simple JSON shape:

```json
{
  "data": [],
  "meta": {
    "count": 0,
    "source": "static-sample-data"
  }
}
```

Errors currently use a simple shape such as:

```json
{
  "error": "Рецептата не е намерена"
}
```

These response shapes may be refined once validation, authentication, pagination, and database
queries are implemented.

## Future Work

The public recipe and category endpoints will later be backed by Drizzle queries against the Neon
PostgreSQL database.

Favorites endpoints will later require an authenticated user session and will return favorites for
the current user instead of static sample data.

Admin endpoints will later require authentication plus an `admin` role check. Real admin actions
such as creating, editing, deleting, publishing, and moderating recipes will be added as protected
API routes.

Planned authentication endpoints such as register, login, refresh, and logout are not implemented
yet.
