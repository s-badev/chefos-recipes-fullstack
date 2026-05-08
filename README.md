## Project Status

**Current phase:** Static full-stack foundation with prepared database and API structure.

Completed foundation work includes:

- GitHub repository setup with visible incremental commit history;
- AI agent/contributor instructions;
- project documentation and environment variable documentation;
- root npm workspace configuration;
- Next.js web app scaffold with verified dependencies;
- Expo mobile app scaffold with verified dependencies;
- Bulgarian web UI foundation:
  - homepage;
  - recipe catalog;
  - recipe details pages;
  - favorites placeholder;
  - admin panel placeholder;
- initial Expo mobile screens using local state and static sample data;
- shared TypeScript types package;
- database package skeleton;
- Drizzle schema draft;
- Drizzle migration setup;
- initial generated SQL migration;
- database client skeleton prepared for future Neon connection;
- initial Next.js API route skeleton;
- static recipe data layer used by recipe-related API routes;
- API endpoint documentation with example responses;
- stable Git save points/tags for rollback safety.

The application currently works with static/sample data. Real database-backed behavior will be added in later stages.

Upcoming work includes:

- real Neon PostgreSQL connection;
- replacing static recipe data with Drizzle queries;
- authentication with JWT access/refresh tokens;
- role-based access control for user/admin flows;
- real favorites functionality;
- real admin create/edit/delete recipe actions;
- production deployment;
- broader testing and final documentation polish.

The project is intentionally developed step by step to keep the architecture clean, the Git history clear, and the implementation realistic for a student capstone.
