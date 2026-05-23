# Chefo's Recipes

Chefo's Recipes is a Bulgarian homemade recipe catalog built with Next.js, TypeScript, Neon PostgreSQL and Drizzle ORM. The web app includes user registration and login, user-specific favorites, role-based admin access, detailed recipe pages, printable recipes and seeded database content.

The interface is Bulgarian-first because the project focuses on practical Bulgarian home cooking. Code and project documentation are kept in English for review and portfolio use.

## Project Status

Status: In Development / Functional Web Version

The web application is functional and includes the core recipe catalog, authentication, favorites, profile and admin areas. The repository is an npm workspace monorepo and also contains a mobile app package, but the implemented production-ready scope documented here is the Next.js web app.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS and global CSS
- Neon PostgreSQL
- Drizzle ORM
- Node.js
- npm workspaces

## Main Features

- Bulgarian recipe catalog with 24 visible recipes
- 6 balanced categories with 4 recipes each
- Category filtering and catalog search
- Recipe cards with images, category badges, difficulty badges, prep time, cook time, servings and tags
- Recipe detail pages with image, details, ingredients and preparation steps
- Working "Запази в любими" / remove favorite flow
- Working "Принтирай рецепта" action using the browser print dialog
- User registration and login
- Users persisted in Neon PostgreSQL
- Hashed passwords
- Signed session/auth flow
- Header personalization with logged-in user name
- Profile page for logged-in users
- User-specific favorites stored in Neon PostgreSQL
- Admin role and admin-only panel
- Seed script with core recipes and generated scalability data
- 10,000 generated recipe records for scalability testing
- Public recipe image assets

## Recipe Categories

The visible catalog is balanced for a clean desktop grid. Each category contains exactly 4 recipes:

| Category | Visible recipes |
|---|---:|
| Салати | 4 |
| Тестени | 4 |
| Основни | 4 |
| Супи | 4 |
| Бързи ястия | 4 |
| Десерти | 4 |

## Authentication

Authentication is implemented in the web app.

- Users are stored in the Neon `users` table.
- Passwords are stored as `password_hash`, not plaintext.
- Roles are stored with the user and support `user` and `admin`.
- The app uses a signed session/auth flow.
- The header reads the current session and displays the logged-in user's name.
- Regular users can access user features such as favorites and profile.
- Admin users can access the admin panel.

Real secrets and credentials must not be committed. Demo credentials can be provided separately for review.

## Favorites

Favorites are database-backed and user-specific.

- Favorites are stored in the Neon `favorites` table.
- Favorites link a user to a recipe.
- Recipe lookup uses stable recipe slugs.
- Users can save recipes from the catalog and recipe detail pages.
- Users can remove saved recipes from the catalog, detail pages and favorites page.
- The favorites page displays only the current user's saved recipes.

## Admin Panel

The app includes an admin role and admin area.

- Admin-only navigation and panel are available for admin users.
- Regular users should not access the admin panel.
- The admin area includes recipe management views and summary information.
- Category/tag statistics and recipe overview data are available for admin review.

## Database and Seed

The database package lives in `packages/db` and contains the Drizzle schema, migrations, Neon client and seed script.

Run the seed script:

```powershell
npm.cmd run seed --workspace packages/db
```

Seed behavior:

- Upserts the core visible catalog recipes by stable slug.
- Seeds categories and tags.
- Keeps the visible recipe slugs compatible with favorites.
- Generates 10,000 additional recipe records for scalability testing.
- Uses batched inserts for large seed data.
- Fake favorites are disabled by default unless explicitly enabled.

## Local Development

Install dependencies:

```powershell
npm install
```

Start the web app:

```powershell
npm.cmd run dev --workspace apps/web
```

Build the web app:

```powershell
npm.cmd run build --workspace apps/web
```

Seed the database:

```powershell
npm.cmd run seed --workspace packages/db
```

## Environment Variables

A local `.env` file is required for database-backed features.

Use placeholders only in documentation:

```env
DATABASE_URL=
SESSION_SECRET=
AUTH_SESSION_SECRET=
NEXT_PUBLIC_APP_URL=
```

`DATABASE_URL` should point to a Neon PostgreSQL database. Session secrets should be local or deployment-specific values and must not be committed.

## Project Structure

```text
chefos-recipes-fullstack/
|-- apps/
|   |-- web/       # Next.js web app
|   `-- mobile/    # Mobile app package in the wider monorepo
|-- packages/
|   |-- db/        # Drizzle schema, migrations, Neon client and seed script
|   `-- shared/    # Shared TypeScript utilities/types
|-- docs/
|-- README.md
`-- package.json
```

## Assets

- Recipe images: `apps/web/public/images/recipes`
- Background image: `apps/web/public/images/backgrounds`

## Screens / Pages

- Home
- Catalog
- Recipe details
- Favorites
- Profile
- Login
- Register
- Admin

## Demo Accounts

Demo credentials can be provided separately for review. Do not commit real credentials or reusable secrets to the repository.

## Notes for Reviewers

- Run the seed script before testing database-backed recipes and favorites.
- Use a regular user account to test favorites.
- Use an admin user account to test the admin panel.
- The browser print dialog may show browser-generated headers and footers, such as the localhost URL, unless "Headers and footers" is disabled in the browser print settings.
- The web build currently passes with:

```powershell
npm.cmd run build --workspace apps/web
```

## Author

Stefan Badev
