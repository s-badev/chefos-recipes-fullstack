
# Chefo’s Recipes

**Chefo’s Recipes** is a full-stack, multi-platform recipe catalog application developed as a SoftUni capstone project for the **Full Stack Apps with AI** course.

The project is designed as a practical recipe platform where users can browse recipes, view detailed cooking instructions, save favorites, and use both a responsive web application and a mobile client. Admin users will be able to manage recipe content through a dedicated web admin panel.

---

## Project Status

**Current phase:** Initial planning and project foundation.

The repository currently contains the base monorepo structure, project documentation, AI agent instructions, and planning files. Application scaffolding, dependencies, database setup, authentication, and UI implementation will be added incrementally in separate commits.

This project is intentionally developed step by step to keep the architecture clean, the Git history clear, and the implementation realistic for a student capstone.

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
