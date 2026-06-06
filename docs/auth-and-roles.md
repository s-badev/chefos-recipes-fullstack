# Authentication And Roles

Chefo's Recipes supports predictable demo accounts for capstone evaluation and database-backed registered users.

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

Demo passwords are validated with salted `scrypt` hashes in the web auth helper. Registered users are stored in Neon PostgreSQL with hashed passwords. Password hashes are not sent to the browser.

The mobile REST API uses JWT access tokens signed with `MOBILE_JWT_SECRET`.

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

The capstone implementation includes login/register, role checks, protected pages, protected admin mutations, and JWT-based mobile API auth. A hardened commercial product would add a fuller account lifecycle, password reset flows, and additional security/audit controls.
