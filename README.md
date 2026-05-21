# Chefo's Recipes

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599)
![Status](https://img.shields.io/badge/Status-In%20Development%20%2F%20Capstone%20Project-orange)

Chefo's Recipes is a full-stack recipe catalog app for browsing, filtering, saving and managing home-style recipes. It combines a Next.js App Router web app, API routes, Server Actions, Neon PostgreSQL, Drizzle ORM, and an Expo React Native mobile app foundation.

The product UI is intentionally Bulgarian-first because the project targets a Bulgarian home-cooking experience and SoftUni capstone presentation context.

## Live Demo

| Platform | URL |
|---|---|
| Web App | Coming soon |
| Expo Web / Mobile Preview | Coming soon |

## Sample Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| User | `user@chefos-recipes.bg` | `user12345` | Catalog, recipe details, favorites, profile |
| Admin | `admin@chefos-recipes.bg` | `admin12345` | Full user access + admin panel, add/edit/delete recipes |

Regular users do not see the Admin navigation item and cannot access admin routes.

## Key Features

### Public Browsing

- Responsive homepage with premium food-site styling
- Recipe catalog with pagination-ready data flow
- Recipe details pages
- About page
- Bulgarian UI copy for a localized product feel

### User Features

- Demo login and logout
- Role-aware navigation
- Favorites area for authenticated users
- Profile area for authenticated users
- Personalized header greeting for logged-in users

### Admin Features

- Admin dashboard
- Admin-only navigation item
- Add recipe form
- Edit recipe form
- Delete recipe action
- Server-side protection for admin pages
- Server-side protection for admin mutations and admin API access

### Database Features

- Neon PostgreSQL connection support
- Drizzle ORM schema
- Generated migration setup
- Users and roles
- Categories, tags, recipes, recipe steps, recipe-tag relations, and favorites
- Deterministic seed logic

### Scalability Features

- 10,000 generated recipes for scalability testing
- Batched seed process
- API pagination for recipe lists
- Service/repository boundary for database reads and mutations

### Mobile Foundation

- Expo React Native app foundation
- Local recipe browsing screens
- Recipe details, categories, favorites, login/register/profile preview states
- Intended companion app for the same recipe domain

## Tech Stack

| Area | Technology |
|---|---|
| Web | Next.js, React, TypeScript |
| Styling | Tailwind CSS / responsive custom UI |
| Backend | Next.js Route Handlers / Server Actions |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Mobile | Expo React Native |
| Monorepo | npm workspaces |
| Deployment | Vercel/Netlify planned |

## Architecture Overview

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

| Path | Purpose |
|---|---|
| `apps/web` | Next.js App Router web app, route handlers, Server Actions, authenticated pages, admin UI |
| `apps/mobile` | Expo React Native mobile foundation using local state and recipe preview screens |
| `packages/db` | Drizzle schema, Neon client, migrations, connection check, seed logic |
| `packages/shared` | Shared TypeScript package placeholder for cross-platform types/utilities |
| `docs` | Supporting architecture, API, database, auth, setup, and submission documentation |

## Web App Pages

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/catalog` | Recipe catalog |
| `/catalog/[slug]` | Recipe details |
| `/favorites` | User favorites |
| `/profile` | User profile |
| `/admin` | Admin dashboard |
| `/admin/recipes/new` | Add recipe |
| `/admin/recipes/[slug]/edit` | Edit recipe |
| `/login` | Login |
| `/register` | Register |
| `/about` | About page |

## API Routes

Only routes that currently exist in `apps/web/src/app/api` are listed.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/health` | `GET` | Health check |
| `/api/recipes` | `GET`, `POST` | Paginated recipe list; admin-protected recipe creation |
| `/api/recipes/[slug]` | `GET`, `PATCH`, `PUT`, `DELETE` | Recipe details; admin-protected update/delete |
| `/api/categories` | `GET` | Category data |
| `/api/favorites` | `GET` | Favorites data, protected |
| `/api/admin/summary` | `GET` | Admin statistics, admin-protected |

Authentication currently uses Server Actions and an httpOnly signed cookie. There are no `/api/auth/*` route files in the current web app.

## Authentication And Authorization

Chefo's Recipes includes demo authentication suitable for capstone testing:

- Login is handled through a Next.js Server Action.
- Logout clears the signed httpOnly session cookie.
- `getCurrentUser()` returns only safe user data: name, email, and role.
- Demo passwords are validated with salted `scrypt` hashes in the web auth helper.
- Password hashes are not exposed to the client.
- Header navigation is rendered from the verified server-side user state.
- Regular users never receive the Admin navigation item.
- Admin pages call `requireAdmin()` on the server.
- Favorites and profile pages call `requireUser()` on the server.
- Admin Server Actions and admin API mutations enforce role checks before mutation logic runs.

Role behavior:

| Visitor | Navigation / Access |
|---|---|
| Guest | Public navigation and login |
| User | Catalog, recipe details, favorites, profile, logout |
| Admin | Full user access plus admin dashboard and recipe management |

## Database Model

Main tables:

- `users`: application users, role, password hash, timestamps
- `recipes`: recipe content, timing, difficulty, category, author
- `categories`: recipe categories
- `tags`: reusable tag records
- `recipe_steps`: ordered cooking instructions
- `recipe_tags`: many-to-many recipe/tag relation
- `favorites`: many-to-many user/recipe relation

Relationships:

- A recipe belongs to one category.
- A recipe belongs to one author user.
- A recipe has many ordered steps.
- Recipes and tags are connected through `recipe_tags`.
- Users and recipes are connected through `favorites`.

See [docs/database-schema.md](docs/database-schema.md) for schema details.

## Scalability

The database package includes deterministic seed logic for scalability testing:

- `LARGE_RECIPE_COUNT = 10000`
- Default batch size: 500 rows
- Generated users, categories, tags, recipes, recipe steps, recipe-tag relations, and favorites
- `SEED_DRY_RUN=true` support for planning without opening a database connection
- Paginated recipe API response shape for large catalog data

## Local Setup

```bash
git clone https://github.com/s-badev/chefos-recipes-fullstack.git
cd chefos-recipes-fullstack
npm install
```

### Environment

Create a local `.env` file from `.env.example` and set the database URL when using Neon-backed flows.

```env
DATABASE_URL="your-neon-database-url"
AUTH_SESSION_SECRET="your-local-session-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`AUTH_SESSION_SECRET` is used by the current web demo session cookie. `DATABASE_URL` is required for Drizzle/Neon database access.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev --workspace apps/web` | Start the Next.js web app |
| `npm run build --workspace apps/web` | Build the web app |
| `npm run start --workspace apps/web` | Start the built web app |
| `npm run seed --workspace @chefos/db` | Run the Drizzle seed script |
| `npm run db:generate --workspace @chefos/db` | Generate Drizzle migrations |
| `npm run db:migrate --workspace @chefos/db` | Run Drizzle migrations |
| `npm run check:connection --workspace @chefos/db` | Check Neon connection config |
| `npm run start --workspace apps/mobile` | Start Expo |
| `npm run web --workspace apps/mobile` | Start Expo web preview |

## Database Setup

1. Create a Neon PostgreSQL project.
2. Copy the Neon connection string into `DATABASE_URL`.
3. Generate and run Drizzle migrations when schema changes are made.
4. Run the seed script for demo/scalability data.

```bash
npm run db:generate --workspace @chefos/db
npm run db:migrate --workspace @chefos/db
npm run seed --workspace @chefos/db
```

The seed package includes demo users in the generated database dataset. The current web demo login also uses app-level demo accounts with salted password hashes for predictable evaluator access.

## Mobile App

The Expo app is currently a foundation / preview companion rather than a finished production mobile client. It includes:

- Recipe list preview
- Recipe details preview
- Category filtering
- Favorites preview
- Login/register/profile preview screens
- Bulgarian UI text matching the product direction

Start it with:

```bash
npm run start --workspace apps/mobile
```

## Project Status

- [x] Web app foundation
- [x] Recipe catalog
- [x] Recipe details
- [x] Neon PostgreSQL integration
- [x] Drizzle schema and migrations
- [x] 10,000 record seed
- [x] Pagination
- [x] Demo authentication
- [x] Role-based admin access
- [x] Admin protected routes
- [x] Admin add/edit/delete
- [x] Expo mobile foundation
- [ ] Production deployment
- [ ] Final mobile polish
- [ ] Final screenshots

## Screenshots

Add screenshots here before final submission.

Suggested screenshot list:

- Homepage
- Catalog
- Recipe details
- Login
- User navigation
- Admin dashboard
- Admin recipe edit
- Mobile preview

## Submission Information

| Field | Value |
|---|---|
| Author | Stefan Badev |
| Email | stefan.badev@yahoo.com |
| GitHub Repo | https://github.com/s-badev/chefos-recipes-fullstack |
| Web Project Live URL | Coming soon |
| Expo Project Live URL | Coming soon |
| Credentials for testing | User and Admin demo accounts listed above |

## Known Limitations

- Mobile app is currently a foundation / preview and not a fully polished production app.
- Production deployment URL is still to be added.
- Some features are capstone-scope implementations rather than commercial production systems.
- Demo authentication is designed for testing; production auth would use a complete account lifecycle and secret management strategy.

## Author

Created by Stefan Badev as part of a SoftUni full-stack / AI-assisted development capstone project.
