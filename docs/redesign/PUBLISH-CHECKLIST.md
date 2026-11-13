# Контролен списък преди публикуване — „Софра“

Одит: 13.11.2026 г. · branch `feat/redesign-sofra` · без push, PR, merge или deploy.

## Резултат

| Проверка | Статус | Доказателство |
|---|---|---|
| Git и отделна тестова база | [ок] | В началото няма променени проследявани файлове; `DATABASE_URL` от сесията е различна от локалната стойност (host `ep-c****`). |
| Четири записващи теста | [проблем] | 3 минали, 1 timeout. Причината е остаряло accessible име в `apps/web/tests/functionality.spec.ts:158`; поправено е спрямо `apps/web/src/app/card-heart.tsx:23`, но не е пускано повторно, за да не се докосва Neon branch-ът след тестовете. |
| Build, lint и TypeScript | [ок] | `build:check`, ESLint и `tsc --noEmit` минават. |
| Playwright без записващите тестове | [ок] | 200 минали, 3 пропуснати, 0 паднали. |
| README | [ок] | Основният и web README описват 24 подбрани + админ рецепти, „Софра“, актуалното стартиране и само имената на env променливите. |
| Canonical, Open Graph и Twitter | [ок] | Начало, Каталог, За нас, Вход и 3 рецепти сочат към `https://chefos-recipes.netlify.app`; social изображенията са JPEG. |
| Robots, sitemap, manifest и икони | [ок] | `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.svg` и `/apple-icon.jpg` връщат 200. |
| Частни страници | [ок] | Вход, регистрация, профил, любими и админ са `noindex`; гостът получава 307 към вход за профил, любими и админ. Виж `apps/web/tests/metadata.spec.ts:61`. |
| Recipe JSON-LD | [ок] | Валиден `Recipe` с основните полета за `shopska-salata`, `bob-chorba` и `musaka-s-kartofi`. |
| Публичен каталог | [ок] | Локално са показани 24 карти; логиката е „24 + manual“ (`apps/web/src/lib/catalog-layout.ts:10`), а публичните заявки филтрират генерираните записи (`apps/web/src/server/recipes/repository.ts:162`). Генериран запис е проверен с 404 от `apps/web/tests/not-found.spec.ts:19`. |
| Admin guard | [ок] | `/admin` не е достъпен за гост; 307 към вход. |
| Търсене за тайни | [ок] | Не е намерена реална тайна. Единственият credential-format match в HEAD е placeholder на `.env.example:2`; в историята: `.env.example:2` и `docs/environment.md:16`. Generic `secret`/`token` съвпаденията са имена на променливи, типове и документация. |
| Netlify env имена | [проблем] | Кодът използва `DATABASE_URL`, `AUTH_SESSION_SECRET`, `MOBILE_JWT_SECRET`, `SITE_URL` и `EXPO_PUBLIC_API_BASE_URL`. `.env.example:2,5,8,11,14` съдържа различен набор и трябва да се синхронизира в отделна позволена задача. |
| `npm audit` | [проблем] | 47 общо: 1 low, 23 moderate, 20 high, 3 critical. Не са правени автоматични поправки. |
| Воден знак | [ок] | Детекторът намира само очакваните шест: `banitsa-s-praz.webp`, `hero-banitsa-shopska-salad.webp`, `palneni-chushki-s-oriz.webp`, `sarmi-s-kiselo-zele.webp`, `shopska-salata.webp`, `tutmanik.webp`; 0 неочаквани. |
| Mobile API | [ок] | `git diff --stat main...HEAD -- apps/web/src/app/api/mobile` е празен. |
| `.gitignore` | [ок] | Покрива `.next`, `.next-check`, `*.log`, `test-results` и `playwright-report`. |
| Размер и PNG политика | [проблем] | След `git gc`: 451.61 MiB pack. Има 221 проследявани PNG: 26 recipe masters, 190 evidence кадъра и 5 други. Това нарушава правилото за JPEG снимки / без PNG в Git. |
| Сървър | [ок] | Няма слушащ audit server след проверките. |

## Мобилни локални измервания

Локален production build, Chromium, viewport 390×844, DPR 2, без throttling; това не са field/Lighthouse данни.

| Страница | LCP | Заредени изображения |
|---|---:|---:|
| Начало | 264 ms | 157 KiB / 14 заявки |
| Рецепти | 388 ms | 219 KiB / 10 заявки |
| Шопска салата | 112 ms | 59 KiB / 3 заявки |

## Неизползвани и условни активи

Нищо не е изтрито.

| Актив | Размер | Употреба | Препоръка |
|---|---:|---|---|
| `apps/web/public/images/recipes/pile-teriyaki.png` | 2641.5 KiB | Untracked входен master; production не го зарежда | **Изтрий** ръчно след потвърждение, че WebP master-ът е достатъчен. |
| `apps/web/public/images/recipes-web/pile-teriyaki.webp` | 228.4 KiB | Поддържан от динамичния loader и тестовете, но текущият DB slug не съвпада | **Остави** само ако ще се коригира името/slug-ът; иначе изтрий с вариантите. |
| 12 `recipes-responsive/pile-teriyaki-*` варианта | 472.5 KiB общо | Използват се само ако master-ът бъде избран | **Остави/изтрий** заедно с WebP master-а. |
| `apps/web/public/images/social/pile-teriyaki.jpg` | 131.2 KiB | Social card само при съвпадащ public recipe | **Остави/изтрий** заедно с WebP master-а. |
| `apps/web/public/images/backgrounds/blurred-food-bg.png` | 1859.9 KiB | Няма препратки в код или CSS | **Изтрий** ръчно или замени с JPEG/WebP. |

Другите нови web assets са използвани по конвенция от responsive/social pipeline; `atmosphere.webp` и `recipe-fallback.svg` имат преки препратки. `apps/web/debug.log` остава локално и вече е игнориран; не е изтрит заради границата на задачата.

## Блокери и препоръки

1. На нов отделен Neon branch да се повторят четирите записващи теста след locator поправката; очакването е 4/4.
2. Да се вземе решение и да се премахнат/конвертират проследяваните PNG снимки и evidence кадри без да се пренаписва история в тази задача.
3. Да се прегледат и отстранят 3 critical и 20 high зависимости с отделна, контролирана промяна.
4. Да се синхронизира `.env.example` с реално използваните имена, без стойности.
5. Да се актуализират отделно остарелите `apps/mobile/README.md`, `docs/environment.md` и `docs/local-setup.md`; mobile пътят е извън разрешения обхват на този одит.

## Ръчно преди deploy

- Създай restore point в Neon.
- Изтрий използвания тестов Neon branch.
- Провери в Netlify само имената: `DATABASE_URL`, `AUTH_SESSION_SECRET`, `MOBILE_JWT_SECRET`; по избор `SITE_URL`. За mobile deployment: `EXPO_PUBLIC_API_BASE_URL`.
- Реши кои от изброените неизползвани/условни активи да останат и почисти локалните untracked/ignored файлове.
- Повтори записващите тестове на нов отделен branch и потвърди 4/4.
- Не публикувай, докато critical/high audit проблемите и PNG политиката не са решени.
