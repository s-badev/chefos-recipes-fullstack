# Web App (Chefo’s Recipes)

This folder contains the Next.js web client shell for the Chefo’s Recipes capstone.

## Status
- Next.js App Router web app with Bulgarian UI screens for the revised capstone scope.
- Static/sample data is used for recipes and admin placeholders.
- API route skeletons exist, but real database queries, authentication, role checks, and Server Actions are still upcoming.
- Tailwind is configured for styling.

## Current Web Screens
- `/` - homepage
- `/catalog` - recipe catalog
- `/catalog/[slug]` - recipe details
- `/favorites` - favorites placeholder
- `/login` - login placeholder
- `/register` - registration placeholder
- `/profile` - user profile placeholder
- `/about` - project information
- `/admin` - admin dashboard placeholder
- `/admin/recipes/new` - add recipe placeholder
- `/admin/recipes/[slug]/edit` - edit recipe placeholder

This gives the web app 10+ screens/pages for the revised SoftUni capstone requirement.

## Planned Integration
- Web mutations will use Server Actions where appropriate.
- The Expo mobile app will continue to consume REST API endpoints.
- Recipe data will later come from Neon PostgreSQL through Drizzle.
- Login, registration, profile, favorites, and admin actions will later use JWT authentication and user/admin authorization.

## Scripts (once dependencies are installed)
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
