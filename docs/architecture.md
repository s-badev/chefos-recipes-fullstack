# Architecture

Chefo's Recipes is a TypeScript monorepo with a Next.js web app, an Expo mobile app foundation, and shared database infrastructure.

## Goals

- Keep the capstone project practical, reviewable, and multi-platform.
- Serve the web app through Next.js App Router pages, Route Handlers, and Server Actions.
- Keep REST endpoints available for the Expo mobile app.
- Use Neon PostgreSQL through Drizzle ORM for persistent recipe data.
- Enforce user/admin authorization on the server.
- Support large recipe datasets through seed generation and pagination.

## Repository Layout

```text
chefos-recipes-fullstack/
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── db/
│   └── shared/
├── docs/
├── README.md
└── package.json
```

| Area | Responsibility |
|---|---|
| `apps/web` | Next.js App Router UI, API routes, Server Actions, auth-aware navigation, admin pages |
| `apps/mobile` | Expo React Native preview/foundation for recipe browsing and account flows |
| `packages/db` | Drizzle schema, Neon client, migrations, seed and connection utilities |
| `packages/shared` | Shared TypeScript package placeholder |
| `docs` | Project documentation for review and submission |

## High-Level Data Flow

```text
Web Pages
  -> Server Components / Server Actions
  -> Auth helpers
  -> Recipe service
  -> Repository
  -> Drizzle ORM
  -> Neon PostgreSQL

Mobile / external clients
  -> Next.js API routes
  -> Auth helpers where required
  -> Recipe service
  -> Repository
  -> Drizzle ORM
  -> Neon PostgreSQL
```

## Web App

The web app uses the Next.js App Router. Public pages are available to guests, while profile/favorites require a logged-in user and admin pages require the `admin` role.

Implemented page groups:

- Public marketing/catalog pages
- Recipe catalog and recipe details
- Login/register screens
- Authenticated profile/favorites screens
- Admin dashboard
- Admin add/edit/delete recipe flows

## Backend Surface

The backend surface currently consists of:

- Next.js Route Handlers under `apps/web/src/app/api`
- Server Actions for login/logout and admin mutations
- Auth helpers in `apps/web/src/server/auth`
- Recipe service/repository modules in `apps/web/src/server/recipes`

Public recipe reads remain available through REST. Admin writes are protected server-side in both Server Actions and API mutation handlers.

## Authentication And Roles

The current implementation uses demo accounts with signed httpOnly cookie sessions. The safe current-user shape contains:

- `name`
- `email`
- `role`

Role behavior:

- Guest: public navigation and login.
- User: favorites/profile access, no admin navigation.
- Admin: full user access plus admin dashboard and recipe mutation actions.

Admin access is not only hidden in the UI. Admin pages and admin mutation paths call server-side role checks.

## Database Integration

`packages/db` defines the Drizzle schema and Neon client. The web app imports database-backed repository functions through `@chefos/db`.

Main tables:

- `users`
- `recipes`
- `categories`
- `tags`
- `recipe_steps`
- `recipe_tags`
- `favorites`

## Scalability Strategy

The database seed process can generate 10,000 recipes with related categories, tags, steps, and favorites. Inserts are batched and support dry-run planning.

Recipe list APIs use pagination fields (`page`, `pageSize`, `total`, `totalPages`) so larger catalog datasets do not need to be loaded at once.

## Deployment Direction

Planned production deployment:

- Web app: Vercel or Netlify
- Database: Neon PostgreSQL
- Mobile preview: Expo tooling

Production URLs are currently marked as coming soon.
