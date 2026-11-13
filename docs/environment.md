# Променливи на средата

Chefo's Recipes използва локален `.env` в корена само за машинно-специфични настройки. Реални стойности, ключове и credentials не трябва да се записват в Git. Копирайте имената от `.env.example` и заменете `replace-me` само в локалния `.env` или в Netlify.

## Web runtime и Netlify

| Променлива | Задължителна в production | Предназначение |
|---|---:|---|
| `DATABASE_URL` | Да | Връзка към PostgreSQL за DB-backed web и mobile API операциите чрез `@chefos/db`. |
| `AUTH_SESSION_SECRET` | Да | Подписва web session cookie. Локалният fallback е само за разработка и не е приемлив за production. |
| `MOBILE_JWT_SECRET` | Да | Подписва JWT за съществуващите `/api/mobile/*` auth endpoints. |
| `SITE_URL` | Не | Незадължителен origin за canonical, Open Graph, Twitter, robots и sitemap; при липса се използва публичният Netlify адрес. |

`NODE_ENV` също се чете от web кода за `secure` session cookie, но се задава автоматично от Next.js/Netlify и не трябва да се добавя ръчно в `.env`.

## Само за локална работа

| Променлива | Предназначение |
|---|---|
| `E2E_BASE_URL` | Base URL за Playwright; без стойност е `http://localhost:3000`. |
| `NEXT_DIST_DIR` | Незадължителна Next.js build директория; `build:check` и `start:check` я задават автоматично на `.next-check`. |
| `SOFRA_PAGE` | При стойност `about` насочва ръчния `scripts/sofra-gaps.mjs` към страницата „За нас“. |

Минимален production шаблон:

```env
DATABASE_URL="replace-me"
AUTH_SESSION_SECRET="replace-me"
MOBILE_JWT_SECRET="replace-me"
SITE_URL="replace-me"
```

Локалните помощни променливи са незадължителни и обичайно не трябва да се задават. `.env` файловете и реалните credentials остават извън Git.
