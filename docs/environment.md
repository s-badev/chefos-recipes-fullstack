# Environment Variables

Chefo's Recipes uses local `.env` files for machine-specific configuration and secrets. Real values must stay out of Git.

## Current Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string used by Drizzle, migrations, connection checks, and seed inserts. |
| `JWT_SECRET` | Secret used by web/backend authentication flows. |
| `JWT_TOKEN` | Deployment token/secret value used by the web/backend environment. |
| `MOBILE_JWT_SECRET` | Secret used by the mobile REST API to sign 7-day JWT access tokens. |
| `EXPO_PUBLIC_API_BASE_URL` | Public API base URL used by the Expo mobile app. |

Example:

```env
DATABASE_URL=
JWT_SECRET=
JWT_TOKEN=
MOBILE_JWT_SECRET=
EXPO_PUBLIC_API_BASE_URL=
```

## Notes

- `DATABASE_URL` is required for database-backed web API calls and `packages/db` scripts.
- `JWT_SECRET` and `JWT_TOKEN` should be set in deployed environments.
- `MOBILE_JWT_SECRET` is required when using `/api/mobile/auth/login`, `/api/mobile/auth/register`, and protected mobile endpoints.
- `EXPO_PUBLIC_API_BASE_URL` should point to `https://chefos-recipes.netlify.app` for the deployed mobile web export.

Do not commit `.env` files or real credentials.
