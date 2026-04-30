# Chefo’s Recipes

A full-stack, multi-platform recipe catalog app (SoftUni capstone).

## Current status
Planning only. This repo contains the initial project structure and documentation. No dependencies are installed yet and no app code exists.

## Tech stack (planned)
- **Web:** Next.js + React + TypeScript + Tailwind CSS
- **API:** Next.js API routes (REST)
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle + migrations
- **Mobile:** Expo React Native
- **Auth:** JWT (access + refresh), role-based access (user/admin)

## Monorepo structure
```
apps/
  web/       # Next.js web app (planned)
  mobile/    # Expo mobile app (planned)
packages/
  db/        # Drizzle schema + migrations (planned)
  shared/    # Shared types, validators, utilities (planned)
docs/        # Architecture, schema, API plans
```

## Planned features
- Public recipe browsing
- Account registration/login
- User recipe favorites
- Admin panel for recipe management
- Responsive web UI
- Mobile-friendly experience

## Planned screens
**Web (≥5):**
1. Home / Discover
2. Recipe details
3. Login / Register
4. Favorites
5. Admin: recipe manager

**Mobile (≥3):**
1. Home / Discover
2. Recipe details
3. Login / Register

## Next milestones (incremental)
1. Initialize Next.js and Expo apps
2. Implement DB schema + migrations
3. Implement auth and REST endpoints
4. Build web screens and admin panel
5. Build mobile screens and sync with API

## Docs
- `docs/architecture.md`
- `docs/database-schema.md`
- `docs/api-endpoints.md`

## Notes
This project is scoped to be realistic for a student capstone. Start small and grow incrementally.
