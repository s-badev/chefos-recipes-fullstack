# Agent & Contributor Guidelines

## Purpose
Keep Chefo's Recipes small, practical, well-documented, and aligned with the SoftUni capstone scope.

## Current State
- The repo is a TypeScript npm workspace with `apps/web`, `apps/mobile`, `packages/db`, and `packages/shared`.
- The web app has Bulgarian UI foundations for home, catalog, recipe details, favorites, and admin placeholders.
- The mobile app has initial Bulgarian recipe screens using local state.
- The db package has a Drizzle schema draft, migration setup, and an initial generated migration.
- Environment variable documentation exists, but real service connections are not wired yet.

## Working Agreement
- Do not install dependencies unless explicitly requested.
- Do not commit real secrets or credentials. Use `.env.example` placeholders only.
- Keep changes small, focused, and reviewable.
- Modify only the packages relevant to the current task.
- Do not touch `apps/web`, `apps/mobile`, `packages/db`, or `packages/shared` unless the task needs it.
- Visible app text should primarily be Bulgarian. Code, comments, and docs may remain English.

## Boundaries
- API routes, authentication, Neon database connection, real favorites/admin actions, and production deployment are future work.
- Do not connect to Neon unless explicitly requested.
- Do not add authentication or role logic unless explicitly requested.
- Do not run database migrations against a real database unless explicitly requested.

## Conventions
- TypeScript everywhere.
- App code lives in `apps/`; shared packages live in `packages/`.
- Planned API routes belong under `apps/web/src/app/api`.
- Drizzle schema and migrations live in `packages/db`.

## Quality Expectations
- Run relevant checks after changes when available.
- Keep schema, migration, API, and environment docs updated when behavior or setup changes.
- Add tests once implementation logic is introduced or behavior becomes non-trivial.

## Roles
- **User:** browse recipes and save favorites.
- **Admin:** manage recipes and moderate content.
