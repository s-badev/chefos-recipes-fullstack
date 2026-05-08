
# Chefo’s Recipes

**Chefo’s Recipes** is a full-stack, multi-platform recipe catalog application developed as a SoftUni capstone project for the **Full Stack Apps with AI** course.

The project is designed as a practical recipe platform where users can browse recipes, view detailed cooking instructions, save favorites, and use both a responsive web application and a mobile client. Admin users will be able to manage recipe content through a dedicated web admin panel.

---

## Project Status

**Current phase:** Foundation and static UI scaffolding.

Completed foundation work includes:

- GitHub repository setup, commit history, and AI agent instructions;
- project documentation files and environment variable documentation;
- root npm workspace configuration;
- Next.js web app scaffold with verified dependencies;
- Expo mobile app scaffold with verified dependencies;
- Bulgarian web UI foundation: homepage, recipe catalog, recipe details, favorites placeholder, and admin placeholder;
- initial mobile recipe screens using local state and static sample data;
- shared TypeScript types package;
- database package skeleton with Drizzle schema draft, migration setup, and initial generated migration.

Upcoming work includes the real Neon database connection, backend API route implementation, authentication and role-based access control, real favorite/admin actions, production deployment, and broader testing.

The project is intentionally developed step by step to keep the architecture clean, the Git history clear, and the implementation realistic for a student capstone.

---

## Project Goals

The goal of this project is to build a complete full-stack application with:

- a **Next.js web application** for desktop and mobile browsers;
- a **Next.js backend API** used as the server-side layer;
- a **PostgreSQL database** hosted with Neon;
- database access through **Drizzle ORM** and migrations;
- an **Expo React Native mobile app**;
- user authentication with **JWT tokens**;
- role-based access control for regular users and admin users;
- a small but functional admin panel;
- clean documentation and a visible GitHub development history.

---

## Planned Tech Stack

| Layer | Technology |
|---|---|
| Web app | Next.js, React, TypeScript, Tailwind CSS |
| Backend API | Next.js API routes / route handlers |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM + migrations |
| Mobile app | React Native with Expo |
| Authentication | JWT access/refresh tokens |
| Authorization | User/admin roles |
| Styling | Tailwind CSS, responsive design |
| Development workflow | VS Code, Codex / GitHub Copilot, GitHub |

---

## Planned Monorepo Structure

```text
chefos-recipes-fullstack/
  apps/
    web/              # Next.js web app and backend API
    mobile/           # Expo React Native mobile app

  packages/
    db/               # Drizzle schema, migrations, database client
    shared/           # Shared types, validators, DTOs and utilities

  docs/
    architecture.md
    database-schema.md
    api-endpoints.md

  AGENTS.md
  README.md
```

---

## Environment Variables

Required environment variable placeholders are documented in `.env.example`.

Planned variables:

- `DATABASE_URL` - future Neon PostgreSQL connection string for Drizzle/database tooling.
- `JWT_SECRET` - future JWT access token signing secret.
- `JWT_REFRESH_SECRET` - future JWT refresh token signing secret.
- `NEXT_PUBLIC_APP_URL` - public base URL for the web app.

Real secrets must not be committed. More details are in `docs/environment.md`.
