# Agent & Contributor Guidelines

## Purpose
Keep the project small, well-documented, and aligned with the capstone scope.

## Working agreement
- **No dependency installation** until explicitly requested.
- **No full app implementation** yet—only planning and scaffolding.
- Keep changes incremental and documented in `docs/`.
- Prefer small, reviewable steps.

## Conventions (planned)
- TypeScript everywhere
- Folder boundaries: app code in `apps/`, shared code in `packages/`
- API routes under `apps/web/src/app/api` (Next.js)

## Quality expectations
- Document assumptions and decisions
- Add tests only once code is introduced
- Keep schema and API docs updated when behavior changes

## Roles
- **User:** browse, save favorites
- **Admin:** manage recipes, moderate content
