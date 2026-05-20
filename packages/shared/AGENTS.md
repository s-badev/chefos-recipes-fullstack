# Shared Package Instructions

This package is for shared TypeScript types, DTOs, validators, and small utilities used across the monorepo.

- Keep this package framework-neutral.
- Do not import Next.js, React Native, Expo, or database-specific runtime code here.
- Prefer portable TypeScript that can be used by web, mobile, API routes, and backend/database-adjacent code.
- Keep shared contracts stable and update all affected consumers when changing exported types or validators.
- Avoid app-specific UI logic, platform-specific code, secrets, and environment access in this package.
- Do not modify web, mobile, or database packages unless the task explicitly requires it.
