# Web App (Chefo’s Recipes)

This folder contains the production Next.js App Router web app and backend for the Chefo’s Recipes capstone.

## Status

- Bulgarian-first “Sofra” interface with responsive, accessible public and authenticated screens.
- Public catalog with 24 curated recipes plus manually added admin recipes; generated scalability records stay hidden and return 404 publicly.
- Neon PostgreSQL data access through Drizzle ORM, signed web sessions, user favorites, and role-protected admin management.
- REST API routes remain available for the Expo mobile client.
- Recipe image upload is intentionally not implemented; recipes without a custom image use the existing fallback treatment.

## Main Routes

- `/`, `/catalog`, `/catalog/[slug]`, `/about`
- `/login`, `/register`, `/profile`, `/favorites`
- `/admin`, `/admin/recipes/new`, `/admin/recipes/[slug]/edit`
- `/api/mobile/*` for the Expo client

## Environment Variable Names

- `DATABASE_URL`
- `AUTH_SESSION_SECRET`
- `MOBILE_JWT_SECRET`
- `SITE_URL` (optional canonical-origin override)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run build:check`
- `npm run start`
- `npm run lint`
- `npm run test:e2e`
