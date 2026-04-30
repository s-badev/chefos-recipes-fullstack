# Architecture Overview

## Goals
- Simple, scalable capstone architecture
- Shared types between web and mobile
- Clear separation of concerns (UI, API, DB)

## High-level design
```
[Web App] ----\
               > [Next.js API Routes] ---> [Neon PostgreSQL]
[Mobile App] -/
```

## Components
- **Web UI (Next.js):** public browsing, auth, admin panel
- **Mobile UI (Expo):** simplified browsing and auth
- **API:** REST endpoints for recipes, auth, and admin actions
- **DB:** PostgreSQL with Drizzle migrations
- **Shared package:** DTOs, validation schemas, enums

## Data flow (contract)
- Input: JSON requests from web/mobile clients
- Processing: API routes validate input and call DB layer
- Output: JSON responses with standardized error shape

## Auth approach (planned)
- JWT access token for API requests
- Refresh token stored securely (httpOnly cookie for web, secure storage for mobile)
- Role claim (`user`/`admin`) used for authorization

## Edge cases to handle later
- Expired/invalid JWTs
- Large recipe lists (pagination)
- Missing or deleted recipes
- Unauthorized admin actions

## Environments
- Local dev, staging (optional), production
- Environment variables for DB URL and JWT secrets
