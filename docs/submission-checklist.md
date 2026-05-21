# Submission Checklist

Use this checklist before final SoftUni capstone submission.

## Core Project

- [x] Monorepo structure
- [x] Next.js web app
- [x] Expo mobile foundation
- [x] Drizzle ORM package
- [x] Neon PostgreSQL connection support
- [x] Database schema and migration setup
- [x] Seed script
- [x] 10,000 recipe seed generation

## Web Features

- [x] Homepage
- [x] Recipe catalog
- [x] Recipe details
- [x] Favorites area
- [x] Profile area
- [x] Login/logout
- [x] Personalized authenticated header greeting
- [x] Role-based navigation
- [x] Admin dashboard
- [x] Admin add recipe
- [x] Admin edit recipe
- [x] Admin delete recipe

## Access Control

- [x] Admin link hidden from guests
- [x] Admin link hidden from regular users
- [x] Admin link visible for admins
- [x] Admin pages protected server-side
- [x] Admin mutations protected server-side
- [x] Regular user blocked from `/admin`

## API And Data

- [x] Health API
- [x] Paginated recipes API
- [x] Recipe details API
- [x] Categories API
- [x] Favorites API protected by user session
- [x] Admin summary API protected by admin role
- [x] Recipe mutation API handlers protected by admin role

## Documentation

- [x] README
- [x] Architecture document
- [x] API endpoints document
- [x] Database schema document
- [x] Auth and roles document
- [x] Local setup document
- [x] Submission checklist
- [ ] Final screenshots
- [ ] Production live URLs

## Final Manual Checks

- [ ] Guest sees no greeting and no Admin link.
- [ ] User login works with `user@chefos-recipes.bg` / `user12345`.
- [ ] User sees greeting, Favorites, Profile, and Logout.
- [ ] User does not see Admin.
- [ ] User cannot open `/admin`.
- [ ] Admin login works with `admin@chefos-recipes.bg` / `admin12345`.
- [ ] Admin sees greeting and Admin link.
- [ ] Admin can open `/admin`.
- [ ] Admin can add/edit/delete recipes.
- [ ] `npm.cmd run build --workspace apps/web` passes.
