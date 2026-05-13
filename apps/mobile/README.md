# Mobile App (Chefo’s Recipes)

Expo + TypeScript mobile client for the Chefo’s Recipes capstone.

## Status
- Local-state navigation only; no React Navigation dependency yet.
- Static/sample recipe data is used.
- No real API calls, authentication, JWT handling, or persistence yet.
- UI is prepared for the revised capstone requirement of 5+ mobile screens.

## Current Mobile Screens
- Recipes - local recipe list.
- Recipe Details - recipe ingredients and preparation steps.
- Categories - local category list with simple recipe filtering.
- Favorites - placeholder for saved recipes.
- Login - placeholder form for future authentication.
- Register - placeholder form for future account creation.
- Profile - placeholder dashboard and account summary.

## Planned Integration
- Recipes, details, categories, and favorites will later consume the Next.js backend through REST API endpoints.
- Login/register flows will later call auth endpoints and receive JWT-based sessions.
- Profile and favorites will later load real user data from protected API endpoints.

## Scripts (once dependencies are installed)
- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
