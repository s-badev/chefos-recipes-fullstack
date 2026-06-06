# Agent & Contributor Guidelines

## Purpose

Keep Chefo's Recipes focused, production-accurate, well-documented, and aligned with the SoftUni capstone/portfolio scope.

## Current State

- The repo is a TypeScript npm workspace with `apps/web`, `apps/mobile`, `packages/db`, and `packages/shared`.
- The web app is a deployed Next.js app on Netlify: `https://chefos-recipes.netlify.app`.
- The Expo mobile web export is deployed on Netlify: `https://chefos-recipes-mobile.netlify.app`.
- Production data is stored in Neon PostgreSQL through Drizzle ORM.
- Web authentication and role checks are implemented.
- Mobile API authentication uses JWTs signed with `MOBILE_JWT_SECRET`.
- The Expo app connects to the deployed REST API through `EXPO_PUBLIC_API_BASE_URL`.
- The admin panel is database-backed and shows database totals plus a limited management list.
- Admin users can add, edit, and delete recipes.
- Public catalog stays curated and lightweight: the polished 24 recipes plus manually added admin recipes.
- Generated 10,000+ scalability records remain in the database/admin view and are intentionally hidden from the public catalog.
- Image upload is intentionally not implemented; admin-created recipes use fallback images when no custom image exists.

## Working Agreement

- Do not install dependencies unless explicitly requested.
- Do not commit real secrets or credentials. Use placeholders only.
- Keep changes small, focused, and reviewable.
- Modify only the packages relevant to the current task.
- Do not touch `apps/web`, `apps/mobile`, `packages/db`, or `packages/shared` unless the task needs it.
- Visible app text should primarily be Bulgarian. Code, comments, and docs may remain English.
- Do not commit automatically unless explicitly asked.

## Guardrails

- Do not expose secrets, local `.env` values, database URLs, JWT values, or production tokens.
- Do not make the public catalog load all 10,000+ generated DB records.
- Public catalog should remain curated and lightweight.
- Manual admin recipes can appear publicly.
- Generated scalability records must stay hidden from the public catalog and public detail routes.
- Admin panel should remain DB-backed and allowed to show DB totals/counts.
- Keep pagination/limits on list endpoints and admin management views.
- Do not change deployment settings unless explicitly requested.
- Do not implement image upload unless explicitly requested.
- Do not run database migrations against production unless explicitly requested.
- Do not change mobile app behavior unless the task explicitly asks for mobile work.

## Conventions

- TypeScript everywhere.
- App code lives in `apps/`; shared packages live in `packages/`.
- Web API routes live under `apps/web/src/app/api`.
- Web server logic lives under `apps/web/src/server`.
- Drizzle schema and migrations live in `packages/db`.
- Prefer existing service/repository layers over direct DB calls in pages/components.
- Keep REST API endpoints available for the Expo mobile app.
- Use stable slugs for recipe routes.
- Keep Drizzle migrations committed when schema changes are made.

## Quality Expectations

- Run relevant checks after changes when available.
- For web changes, prefer `npm.cmd run build --workspace apps/web`.
- For documentation-only changes, at minimum run `git diff --stat`.
- Keep schema, migration, API, deployment, and environment docs updated when behavior changes.
- Add tests once implementation logic becomes non-trivial or shared behavior changes.

## Roles

- **Visitor:** browse curated/manual public recipes and open recipe details.
- **User:** visitor access plus profile and saved favorites.
- **Admin:** user access plus database-backed recipe management and scalability-record visibility in admin.
