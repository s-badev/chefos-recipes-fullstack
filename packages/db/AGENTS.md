# Database Package Instructions

This package owns the Drizzle schema, migrations, database client, and seed scripts.

- `DATABASE_URL` must come only from environment variables.
- Never commit real credentials or local `.env` files.
- Make schema changes through the Drizzle schema and committed migrations.
- Do not edit generated migrations casually; prefer creating a new planned migration for schema changes.
- Seed scripts must not run automatically as part of normal imports, builds, or app startup.
- Keep large seed data and batched inserts explicit, reviewable, and safe to run intentionally.
- Add indexes through planned Drizzle migrations, not ad hoc database changes.
- Do not modify web, mobile, or shared packages unless the task explicitly requires it.
