# Chefo’s Recipes — Full-Stack Bulgarian Recipe Catalog

<p>
  <a href="https://chefos-recipes.netlify.app">
    <img src="https://img.shields.io/badge/Web%20Live%20Demo-Open%20App-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Web Live Demo" />
  </a>
  <a href="https://chefos-recipes-mobile.netlify.app">
    <img src="https://img.shields.io/badge/Expo%20Web%20Demo-Open%20Mobile-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Web Demo" />
  </a>
</p>

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-Mobile%20Web-000020?logo=expo)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-Database-C5F74F)
![PostgreSQL / Neon](https://img.shields.io/badge/PostgreSQL%20/%20Neon-Production%20DB-00E599?logo=postgresql&logoColor=white)
![JWT Auth](https://img.shields.io/badge/JWT%20Auth-Mobile%20API-2F855A)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify&logoColor=white)
![Full-Stack](https://img.shields.io/badge/Full--Stack-Capstone-brightgreen)
![Portfolio Project](https://img.shields.io/badge/Portfolio%20Project-Ready-blueviolet)

**Chefo’s Recipes** is a deployed full-stack Bulgarian recipe catalog built with **Next.js**, **React**, **TypeScript**, **Expo**, **Neon PostgreSQL**, and **Drizzle ORM**.

The project includes a production web app and backend on Netlify, an Expo mobile web export on Netlify, real authentication, user favorites, role-based admin access, database-backed recipe management, and REST endpoints consumed by the mobile client.

It was developed as a SoftUni **Full Stack Apps with AI** capstone project and is structured as a portfolio-ready npm workspace monorepo.

---

## Live Demos

| Platform | URL |
|---|---|
| Web app + backend API | https://chefos-recipes.netlify.app |
| Expo mobile web export | https://chefos-recipes-mobile.netlify.app |

---

## Review Access

| Role | Email | Password | What to test |
|---|---|---|---|
| User | `user@chefos-recipes.bg` | `user12345` | Catalog, details, favorites, profile |
| Admin | `admin@chefos-recipes.bg` | `admin12345` | User flow plus protected admin management |

Regular users do not see the Admin navigation item and cannot access admin-only pages manually.

---

## Highlights

- Bulgarian-first public UI for recipe browsing, favorites, profile, and admin management.
- Polished curated public catalog with 24 hand-presented recipes.
- Manually added admin recipes can appear in the public catalog.
- Generated 10,000+ scalability records are intentionally hidden from the public catalog.
- Database-backed admin panel with DB totals/counts and a limited management list.
- Admin add/edit/delete recipe flow backed by Neon PostgreSQL.
- Admin-created recipes without custom images use fallback recipe imagery.
- Recipe details handle missing ingredients/steps gracefully.
- User registration/login, JWT-based mobile API auth, and user-specific favorites.
- Expo mobile app deployed as a web export and connected to the deployed REST API.
- Separate production deployments for web/backend and mobile.

---

## Catalog And Data Model

The public catalog is intentionally curated and lightweight.

- Public catalog shows the polished 24-recipe collection.
- Public catalog can also show manually created admin recipes.
- Public catalog does not load or display the 10,000+ generated scalability records.
- Generated scalability records remain in Neon PostgreSQL for database/admin testing.
- Admin panel shows database totals and a limited DB management list, such as 50 records from 10,000+.
- Admin-created recipes are editable/deletable through the admin panel and can be reviewed publicly when they pass the public catalog filter.

This split keeps the user experience fast and polished while still demonstrating large database handling and admin management.

---

## Features

### Web App

- Home page with Bulgarian product presentation.
- Curated recipe catalog.
- Category filters and search.
- Recipe details with images, timing, servings, tags, ingredients, steps, and print action.
- Authentication and profile.
- User-specific favorites.
- Protected admin panel.
- Add, edit, and delete recipes.
- Database-backed admin counts and management list.
- Public visibility for manually added admin recipes.

### Backend

- Next.js App Router route handlers and Server Actions.
- REST endpoints for web/mobile recipe, category, auth, profile, and favorites flows.
- JWT auth for mobile API flows.
- Neon PostgreSQL production database.
- Drizzle ORM schema, migrations, repository layer, and seed script.
- 10,000+ generated scalability records.
- Public catalog filtering that hides generated records while keeping curated/manual recipes visible.

### Mobile

- Expo mobile app deployed as a web export.
- Connects to the deployed Next.js REST API.
- Catalog browsing.
- Recipe details.
- Login and profile.
- Favorites.

---

## Architecture

```text
chefos-recipes-fullstack/
|-- apps/
|   |-- web/
|   |   |-- src/app/              # Next.js pages, API routes, UI components
|   |   |-- src/data/             # Curated public recipe collection
|   |   |-- src/server/           # Auth, favorites, recipes, server actions
|   |   |-- src/lib/              # Shared web utilities
|   |   `-- public/images/        # Recipe and background assets
|   |
|   `-- mobile/
|       |-- src/screens/          # Expo screens
|       |-- src/components/       # Mobile UI components
|       |-- src/services/         # REST API client
|       |-- src/context/          # Mobile auth/session state
|       `-- App.tsx               # Expo app root
|
|-- packages/
|   |-- db/                       # Drizzle schema, migrations, seed, Neon client
|   `-- shared/                   # Shared TypeScript utilities/types
|
|-- docs/
|-- AGENTS.md
|-- README.md
`-- package.json
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Web | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS and global CSS |
| Backend | Next.js route handlers and Server Actions |
| Mobile | Expo React Native, React Native Web |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Cookie sessions for web, JWT for mobile API |
| Deployment | Netlify |
| Monorepo | npm workspaces |

---

## API Overview

The Expo mobile app uses REST endpoints from the deployed Next.js app:

```text
https://chefos-recipes.netlify.app/api/mobile
```

Key endpoints include:

| Endpoint | Purpose |
|---|---|
| `/api/mobile/health` | Mobile API health check |
| `/api/mobile/categories` | Categories |
| `/api/mobile/recipes` | Paginated recipe catalog |
| `/api/mobile/recipes/[slug]` | Recipe details |
| `/api/mobile/auth/login` | Mobile login |
| `/api/mobile/auth/register` | Mobile registration |
| `/api/mobile/auth/me` | Current mobile user |
| `/api/mobile/favorites` | User favorites |
| `/api/mobile/favorites/[slug]` | Remove favorite by recipe slug |

Admin and recipe API routes are protected server-side where required.

---

## Environment Variables

Use placeholders only in committed files:

```env
DATABASE_URL=
JWT_SECRET=
JWT_TOKEN=
MOBILE_JWT_SECRET=
EXPO_PUBLIC_API_BASE_URL=
```

- `DATABASE_URL` points to Neon PostgreSQL.
- `JWT_SECRET` and `JWT_TOKEN` are web/backend secrets.
- `MOBILE_JWT_SECRET` signs mobile API JWTs.
- `EXPO_PUBLIC_API_BASE_URL` points the Expo app at the deployed API.

Never commit real secrets or local `.env` files.

---

## Deployment

### Web App + Backend

| Setting | Value |
|---|---|
| Platform | Netlify |
| Live URL | https://chefos-recipes.netlify.app |
| App | `apps/web` |
| Build command | `npm --workspace @chefos/web run build` |
| Database | Neon PostgreSQL |
| Required env vars | `DATABASE_URL`, `JWT_SECRET`, `JWT_TOKEN`, `MOBILE_JWT_SECRET` |

### Expo Mobile Web Export

| Setting | Value |
|---|---|
| Platform | Netlify |
| Live URL | https://chefos-recipes-mobile.netlify.app |
| App | `apps/mobile` |
| Build command | `npm --workspace @chefos/mobile run build` |
| Publish directory | `apps/mobile/dist` |
| Required env var | `EXPO_PUBLIC_API_BASE_URL=https://chefos-recipes.netlify.app` |

---

## Local Development

Install dependencies:

```powershell
npm install
```

Start the web app:

```powershell
npm.cmd run dev --workspace apps/web
```

Build the web app:

```powershell
npm.cmd run build --workspace apps/web
```

Build the Expo mobile app:

```powershell
npm.cmd run build --workspace @chefos/mobile
```

Seed the database:

```powershell
npm.cmd run seed --workspace packages/db
```

---

## Testing Checklist

- Web app opens.
- Public catalog opens.
- Category filters work.
- Recipe details open.
- User login works.
- Favorites work.
- Profile opens.
- Admin login works.
- Admin DB count/list loads.
- Admin add recipe works.
- Admin edit recipe works.
- Admin delete recipe works.
- Manual admin recipe appears in public catalog.
- Generated scalability records stay hidden from public catalog.
- Mobile web export opens.
- Mobile login/profile/favorites work.

---

## Project Status

| Area | Status |
|---|---|
| Next.js web app | Deployed |
| Web/backend API | Deployed |
| Neon PostgreSQL integration | Active |
| Drizzle ORM schema/seed | Active |
| Public curated catalog | Complete |
| Manual admin recipe public visibility | Complete |
| Generated scalability records | Hidden publicly, available in DB/admin |
| Authentication and roles | Complete |
| Favorites | Complete |
| Admin add/edit/delete | Complete |
| Expo mobile web export | Deployed |
| Mobile API integration | Complete |

---

## Submission Information

| Field | Value |
|---|---|
| Project | Chefo’s Recipes |
| Type | Full-stack Bulgarian recipe catalog with web and mobile clients |
| Author | Stefan Badev |
| Email | stefan.badev@yahoo.com |
| GitHub Repo | https://github.com/s-badev/chefos-recipes-fullstack |
| Web Live URL | https://chefos-recipes.netlify.app |
| Expo Mobile Live URL | https://chefos-recipes-mobile.netlify.app |
| Database | Neon PostgreSQL with Drizzle ORM |
| Deployment | Netlify |

---

## Notes

- Image upload is intentionally not implemented.
- Admin-created recipes without custom images use fallback images.
- Recipes without full ingredients/steps use graceful fallback text where needed.
- Generated scalability records are not shown publicly by design.
- This is a capstone/portfolio project, not a hardened commercial SaaS product.

---

## Author

Built by Stefan Badev as a capstone and portfolio-ready full-stack application.
