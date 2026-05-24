# Local Setup

## Prerequisites

- Node.js compatible with the project dependencies
- npm
- Neon PostgreSQL project for database-backed flows

## Install

```bash
git clone https://github.com/s-badev/chefos-recipes-fullstack.git
cd chefos-recipes-fullstack
npm install
```

## Environment

Create `.env` in the repository root.

```env
DATABASE_URL="your-neon-database-url"
AUTH_SESSION_SECRET="your-local-session-secret"
MOBILE_JWT_SECRET="your-local-mobile-api-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`DATABASE_URL` is required by the Drizzle/Neon database client. `AUTH_SESSION_SECRET` signs the current demo session cookie. If it is missing locally, the app uses a development fallback. `MOBILE_JWT_SECRET` signs the mobile REST API JWT tokens.

## Web Commands

```bash
npm run dev --workspace apps/web
npm run build --workspace apps/web
npm run start --workspace apps/web
```

The requested validation command for the web app is:

```bash
npm.cmd run build --workspace apps/web
```

## Database Commands

```bash
npm run check:connection --workspace @chefos/db
npm run db:generate --workspace @chefos/db
npm run db:migrate --workspace @chefos/db
npm run seed --workspace @chefos/db
```

To dry-run the seed without opening a database connection:

```bash
SEED_DRY_RUN=true npm run seed --workspace @chefos/db
```

On Windows PowerShell, set the variable first:

```powershell
$env:SEED_DRY_RUN="true"
npm run seed --workspace @chefos/db
```

## Mobile Commands

```bash
npm run start --workspace apps/mobile
npm run web --workspace apps/mobile
npm run android --workspace apps/mobile
npm run ios --workspace apps/mobile
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | `user@chefos-recipes.bg` | `user12345` |
| Admin | `admin@chefos-recipes.bg` | `admin12345` |
