# Architecture Overview

## Goals
- Simple, scalable capstone architecture
- Shared types between web and mobile
- Clear separation of concerns (UI, backend flows, services, DB)
- Support the revised SoftUni requirements for Next.js, Expo, Neon PostgreSQL, Drizzle, JWT auth, and role-based access

## High-level design
```
[Web App] --> [Server Actions where appropriate] --\
                                                   > [Service/Repository Layer] --> [Drizzle ORM] --> [Neon PostgreSQL]
[Mobile App] --> [Next.js REST API Routes] -------/
```

## Components
- **Web app and backend (Next.js):** public browsing, auth, favorites, admin panel, route handlers, and Server Actions where appropriate
- **Mobile UI (Expo):** simplified browsing, favorites, profile/auth flows, and REST API consumption
- **REST API:** endpoints for the Expo mobile app and any external/client flows that need JSON over HTTP
- **Server Actions:** planned for web mutations where they reduce client/API ceremony while preserving validation and authorization
- **Service/repository layer:** planned boundary between API/actions and Drizzle queries so business rules are not duplicated
- **DB:** Neon serverless PostgreSQL with Drizzle schema and committed migrations
- **Seed foundation:** deterministic large dataset generator and opt-in batched Drizzle seed script for database scalability validation
- **Shared package:** DTOs, validation schemas, enums

## Data flow (contract)
- Input: JSON requests from the mobile client, and web form/action input from the Next.js app
- Processing: API routes or Server Actions validate input, enforce auth/roles, and call the service/repository layer
- Output: JSON responses with standardized error shape

Current static/sample data helpers will be replaced by Drizzle queries against Neon as the backend is implemented.

## Scalability and seed strategy

The database package prepares a 10,000-recipe seed dataset for the revised SoftUni capstone scalability requirement. The generator creates deterministic in-memory users, categories, tags, recipes, recipe steps, recipe-tag relations and favorites.

The seed script is intentionally opt-in:

- `SEED_DRY_RUN=true` summarizes generated data without opening a database connection.
- Real inserts require `DATABASE_URL` from the local environment.
- Real credentials must never be committed.
- Inserts are batched with a default size of 500 rows.
- Stable IDs, slugs and emails plus conflict-skipping behavior make repeated seed runs idempotent where possible.

Recipe API and catalog pagination are part of the architecture for handling large lists. Query performance will be validated with the large seed dataset before final delivery.

## Planned database indexes

Indexes should follow the actual query patterns introduced by the API, catalog, favorites and admin flows. The current plan prioritizes:

- `recipes.slug`
- `recipes.category_id`
- `recipes.created_at`
- `recipe_tags.recipe_id`
- `recipe_tags.tag_id`
- `favorites.user_id`
- `favorites.recipe_id`

Index changes must be committed through Drizzle migrations when finalized.

## Auth approach (planned)
- JWT access token for API requests
- Refresh token stored securely (httpOnly cookie for web, secure storage for mobile)
- Role claim (`user`/`admin`) used for authorization
- Password hashes stored in the database using bcrypt or argon2

## Edge cases to handle later
- Expired/invalid JWTs
- Large recipe lists (pagination)
- Missing or deleted recipes
- Unauthorized admin actions

## Environments
- Local dev, staging (optional), production
- Environment variables for DB URL and JWT secrets
