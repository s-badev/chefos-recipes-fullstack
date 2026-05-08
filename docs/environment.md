# Environment Variables

Chefo's Recipes will use local `.env` files for machine-specific configuration and secrets. Real
values must stay out of Git. The committed `.env.example` file documents the required variable names
with placeholder values only.

## Planned Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for the future Neon database. |
| `JWT_SECRET` | Secret used later to sign JWT access tokens. |
| `JWT_REFRESH_SECRET` | Separate secret used later to sign JWT refresh tokens. |
| `NEXT_PUBLIC_APP_URL` | Public base URL for the web application, such as `http://localhost:3000` locally. |

## Later Usage

When database and authentication work begins, each developer should copy `.env.example` to a local
`.env` file and replace the placeholders with real values for their own environment.

The Drizzle config will read `DATABASE_URL` when migrations or database tooling need a connection.
Authentication code will use `JWT_SECRET` and `JWT_REFRESH_SECRET` once JWT login and refresh flows
are implemented. `NEXT_PUBLIC_APP_URL` can be used by web-facing features that need the app's base
URL.

Do not commit `.env` files or real credentials.
