# API Endpoints

Base path: `/api`

The current API routes are initial Next.js route handlers. They return static/sample data only and
are not connected to Neon, Drizzle, authentication, JWTs, or real user sessions yet.

The recipe-related routes read from the shared static web data layer. Database-backed responses will
replace these helpers later.

## GET /api/health

- Method: `GET`
- Path: `/api/health`
- Purpose: Basic health check for the web app API.
- Current behavior: Returns API status, app name, and a generated timestamp.

```json
{
  "status": "ok",
  "appName": "Chefo's Recipes",
  "timestamp": "2026-05-08T17:00:00.000Z"
}
```

Future note: This may later include database connectivity status once Neon is wired.

## GET /api/recipes

- Method: `GET`
- Path: `/api/recipes`
- Purpose: Public recipe list endpoint.
- Current behavior: Returns the full static sample recipe list.

```json
{
  "data": [
    {
      "title": "Шопска салата",
      "slug": "shopska-salad",
      "description": "Свежа класика с домати, краставици, печени чушки, магданоз и настъргано сирене.",
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 0,
      "servings": 4,
      "difficulty": "Лесна",
      "category": "Салати",
      "tags": ["Свежо", "Вегетарианско", "Лято"],
      "ingredients": ["4 зрели домата", "1 краставица"],
      "steps": ["Нарежи доматите, краставицата, печените чушки и лука."]
    }
  ],
  "meta": {
    "count": 9,
    "source": "static-sample-data"
  }
}
```

Future note: This list will later come from Drizzle queries against the Neon PostgreSQL database.

## GET /api/recipes/[slug]

- Method: `GET`
- Path: `/api/recipes/[slug]`
- Purpose: Public recipe details endpoint by recipe slug.
- Current behavior: Returns one static sample recipe when found; returns `404` when the slug does not exist.

```json
{
  "data": {
    "title": "Баница със сирене",
    "slug": "banitsa-with-sirene",
    "description": "Фини кори с яйца, кисело мляко и бяло сирене, изпечени до златиста коричка.",
    "prepTimeMinutes": 25,
    "cookTimeMinutes": 40,
    "servings": 8,
    "difficulty": "Средна",
    "category": "Тестени",
    "tags": ["Закуска", "С печене", "Сирене"],
    "ingredients": ["500 г кори за баница", "350 г бяло сирене"],
    "steps": ["Разбий яйцата с киселото мляко, содата и олиото."]
  }
}
```

Example `404` response:

```json
{
  "error": "Рецептата не е намерена"
}
```

Future note: The slug lookup will later become a database query.

## GET /api/categories

- Method: `GET`
- Path: `/api/categories`
- Purpose: Public category list endpoint.
- Current behavior: Returns categories derived from the same static recipe data, including recipe counts.

```json
{
  "data": [
    {
      "name": "Салати",
      "recipeCount": 1
    },
    {
      "name": "Основни",
      "recipeCount": 3
    }
  ],
  "meta": {
    "count": 6,
    "source": "static-sample-data"
  }
}
```

Future note: Category counts will later be calculated from database-backed recipes.

## GET /api/favorites

- Method: `GET`
- Path: `/api/favorites`
- Purpose: Placeholder favorites endpoint.
- Current behavior: Returns three featured sample recipes as stand-ins for favorites.

```json
{
  "data": [
    {
      "title": "Шопска салата",
      "slug": "shopska-salad",
      "category": "Салати",
      "difficulty": "Лесна"
    }
  ],
  "message": "Примерни любими рецепти. Реалните любими ще бъдат свързани с потребителски профил.",
  "meta": {
    "count": 3,
    "source": "static-sample-data"
  }
}
```

Future note: This route will later require an authenticated user session and return that user's
saved recipes from the database.

## GET /api/admin/summary

- Method: `GET`
- Path: `/api/admin/summary`
- Purpose: Placeholder admin dashboard summary endpoint.
- Current behavior: Returns static summary counts based on the shared sample recipe data.

```json
{
  "data": {
    "totalRecipes": 9,
    "totalCategories": 6,
    "totalTags": 17
  },
  "message": "Placeholder админ статистика. Реалните данни ще идват от база данни."
}
```

Future note: This route will later require authentication and an `admin` role check, then read real
summary data from Neon through Drizzle.
