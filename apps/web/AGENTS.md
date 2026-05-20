# Web Workspace Instructions

This folder contains the Next.js web app and backend API route workspace for Chefo's Recipes.

- Visible public website text should be in Bulgarian.
- Public UI must not mention SoftUni, capstone requirements, Neon, Drizzle, REST API, Server Actions, or other implementation details.
- Keep technical and capstone wording in README/docs, not in user-facing screens.
- API routes under `src/app/api` are consumed by the mobile app and should remain stable unless a task explicitly changes the contract.
- Prefer Next.js Server Actions for future web mutations where appropriate, while keeping REST endpoints available for mobile use.
- Keep web changes scoped to this app. Do not modify `apps/mobile`, `packages/db`, or `packages/shared` unless the task explicitly requires it.
- Do not add credentials, local `.env` files, or dependencies unless explicitly requested.
