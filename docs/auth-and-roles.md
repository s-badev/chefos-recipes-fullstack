# Authentication And Roles

Chefo's Recipes currently uses demo authentication for predictable capstone evaluation.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| User | `user@chefos-recipes.bg` | `user12345` |
| Admin | `admin@chefos-recipes.bg` | `admin12345` |

## Session Model

The web app uses:

- Next.js Server Actions for login/logout.
- A signed httpOnly cookie for session state.
- A server-side `getCurrentUser()` helper.
- Safe user data only: `name`, `email`, `role`.

The current demo passwords are validated with salted `scrypt` hashes in the web auth helper. Password hashes are not sent to the browser.

## Role Behavior

| Role | Behavior |
|---|---|
| Guest | Sees public navigation and login. No greeting. No admin link. |
| User | Sees catalog, favorites, profile, greeting, logout. No admin link. |
| Admin | Sees user navigation plus admin link, greeting, logout. |

## Navigation Rules

- Guests see: Home, Catalog, About, Login.
- Users see: Home, Catalog, Favorites, Profile, About, greeting, Logout.
- Admins see: Home, Catalog, Favorites, Profile, Admin, About, greeting, Logout.

The Admin link is not rendered for guests or regular users.

## Server Protection

Protected pages:

- `/favorites`: requires a user session.
- `/profile`: requires a user session.
- `/admin`: requires admin role.
- `/admin/recipes/new`: requires admin role.
- `/admin/recipes/[slug]/edit`: requires admin role.

Protected admin mutations:

- create recipe
- update recipe
- delete recipe

Protected API routes:

- `POST /api/recipes`
- `PATCH /api/recipes/[slug]`
- `PUT /api/recipes/[slug]`
- `DELETE /api/recipes/[slug]`
- `GET /api/admin/summary`

Regular users cannot access admin pages manually and cannot call admin mutations successfully.

## Production Notes

For a production system, the demo auth layer would be replaced with a full account lifecycle, database-backed password hashes, password reset flows, and a hardened secret/session strategy.
