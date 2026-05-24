# Environment Variables

Chefo's Recipes uses local `.env` files for machine-specific configuration and secrets. Real values must stay out of Git.

## Current Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string used by Drizzle, migrations, connection checks, and seed inserts. |
| `AUTH_SESSION_SECRET` | Secret used by the current web demo session cookie signing logic. |
| `MOBILE_JWT_SECRET` | Secret used by the mobile REST API to sign 7-day JWT access tokens. |
| `NEXT_PUBLIC_APP_URL` | Public base URL for the web application, such as `http://localhost:3000` locally. |

Example:

```env
DATABASE_URL="postgresql://user:password@host:5432/chefos_recipes?sslmode=require"
AUTH_SESSION_SECRET="replace-with-a-long-local-secret"
MOBILE_JWT_SECRET="replace-with-a-long-mobile-api-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Notes

- `DATABASE_URL` is required for database-backed web API calls and `packages/db` scripts.
- `AUTH_SESSION_SECRET` should be set for local and production-like testing. The app has a development fallback, but committed or deployed environments should use their own secret.
- `MOBILE_JWT_SECRET` is required when using `/api/mobile/auth/login`, `/api/mobile/auth/register`, and protected mobile endpoints.
- For local Next.js development in this monorepo, set `MOBILE_JWT_SECRET` in `apps/web/.env.local` so the web workspace can read it.

Do not commit `.env` files or real credentials.
