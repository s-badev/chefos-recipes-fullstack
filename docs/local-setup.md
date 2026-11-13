# Локално стартиране

## Предварителни условия

- Node.js, съвместим с текущите зависимости
- npm
- достъп до отделна PostgreSQL/Neon среда само когато ще се проверяват DB-backed потоци

## Инсталиране

```powershell
git clone https://github.com/s-badev/chefos-recipes-fullstack.git
Set-Location chefos-recipes-fullstack
npm.cmd install
```

## Среда

Създайте локален `.env` в корена и използвайте само имената от `.env.example`. Не копирайте production credentials в документация или commit-и.

```env
DATABASE_URL="replace-me"
AUTH_SESSION_SECRET="replace-me"
MOBILE_JWT_SECRET="replace-me"
SITE_URL="replace-me"
```

За обикновен UI преглед без DB-backed операции `DATABASE_URL` не е нужна. За регистрация, DB потребители, любими, admin управление и mobile auth endpoints е нужна отделна тестова база. `E2E_BASE_URL`, `NEXT_DIST_DIR` и `SOFRA_PAGE` са незадължителни локални настройки, описани в `docs/environment.md`.

## Web команди

Development server:

```powershell
npm.cmd run dev --workspace apps/web
```

Проверочен production build в отделна `.next-check` директория:

```powershell
npm.cmd run build:check --workspace apps/web
```

Стартиране на проверочния build:

```powershell
npm.cmd run start:check --workspace apps/web -- -p 3000
```

## Playwright без DB записи

Първо стартирайте `dev` или `start:check`, после в отделен терминал изпълнете тестовете с изключени четирите сценария, които записват в Neon:

```powershell
npm.cmd run test:e2e --workspace apps/web -- --grep-invert "real Neon registration|real Neon admin|favourite: a guest|admin recipe on the substitute image"
```

Пълният suite включва регистрация, любими и admin create/edit/delete и трябва да се пуска само срещу свеж отделен тестов Neon branch. Тази команда не е част от затварящата документационна задача.

## Други проверки

```powershell
npm.cmd run lint --workspace apps/web
npm.cmd exec tsc --workspace apps/web -- --noEmit
```

Не изпълнявайте миграции или seed срещу production. Mobile командите и `apps/mobile/README.md` са извън обхвата на тази документация.
