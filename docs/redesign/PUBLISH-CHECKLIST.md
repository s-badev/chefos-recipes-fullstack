# Контролен списък преди публикуване — „Софра“

Одит: 13.11.2026 г. · branch `feat/redesign-sofra` · без push, PR, merge или deploy.

## Резултат

| Проверка | Статус | Доказателство |
|---|---|---|
| Git и отделна тестова база | [ок] | Клонът е `feat/redesign-sofra`; в затварящата задача `DATABASE_URL` не е зададена и не са изпълнявани DB команди. |
| Четири записващи теста | [чака отделна задача] | Регистрационният сценарий и останалите записващи тестове трябва да се повторят на свеж отделен Neon branch; в тази задача не е използвана база. |
| Build, lint и TypeScript | [ок] | `build:check`, ESLint и `tsc --noEmit` минават. |
| Playwright без записващите тестове | [ок] | 200 минали, 3 пропуснати, 0 паднали. |
| README | [ок] | Основният и web README описват 24 подбрани + админ рецепти, „Софра“, актуалното стартиране и само имената на env променливите. |
| Canonical, Open Graph и Twitter | [ок] | Начало, Каталог, За нас, Вход и 3 рецепти сочат към `https://chefos-recipes.netlify.app`; social изображенията са JPEG. |
| Robots, sitemap, manifest и икони | [ок] | `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.svg` и `/apple-icon.jpg` връщат 200. |
| Частни страници | [ок] | Вход, регистрация, профил, любими и админ са `noindex`; гостът получава 307 към вход за профил, любими и админ. Виж `apps/web/tests/metadata.spec.ts:61`. |
| Recipe JSON-LD | [ок] | Валиден `Recipe` с основните полета за `shopska-salata`, `bob-chorba` и `musaka-s-kartofi`. |
| Публичен каталог | [ок] | Локално са показани 24 карти; логиката е „24 + manual“ (`apps/web/src/lib/catalog-layout.ts:10`), а публичните заявки филтрират генерираните записи (`apps/web/src/server/recipes/repository.ts:162`). Генериран запис е проверен с 404 от `apps/web/tests/not-found.spec.ts:19`. |
| Admin guard | [ок] | `/admin` не е достъпен за гост; 307 към вход. |
| Търсене за тайни | [ок] | Не е намерена реална тайна. Credential-format примерите в `.env.example` и `docs/environment.md` са заменени с `replace-me`; generic `secret`/`token` съвпаденията са имена и документация. |
| Netlify env имена | [поправено] | `.env.example`, `docs/environment.md` и `docs/local-setup.md` са синхронизирани с web runtime и локалните web инструменти; production имената са `DATABASE_URL`, `AUTH_SESSION_SECRET`, `MOBILE_JWT_SECRET` и незадължителното `SITE_URL`. |
| `npm audit` | [анализирано] | 47 общо: 1 low, 23 moderate, 20 high, 3 critical. Решенията и достижимостта са в `docs/redesign/NPM-AUDIT-TRIAGE.md`; не са правени автоматични поправки. |
| Воден знак | [ок] | Детекторът намира само очакваните шест: `banitsa-s-praz.webp`, `hero-banitsa-shopska-salad.webp`, `palneni-chushki-s-oriz.webp`, `sarmi-s-kiselo-zele.webp`, `shopska-salata.webp`, `tutmanik.webp`; 0 неочаквани. |
| Mobile API | [ок] | `git diff --stat main...HEAD -- apps/web/src/app/api/mobile` е празен. |
| `.gitignore` | [ок] | Покрива `.next`, `.next-check`, `*.log`, `test-results` и `playwright-report`. |
| Размер и PNG политика | [отложено; не блокира] | След `git gc`: 451.61 MiB pack и 221 проследявани PNG. Решението се отлага без пренаписване на историята и не блокира публикуването. |
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
| `apps/web/public/images/recipes/pile-teriyaki.png` | 2641.5 KiB | Untracked входен master; production не го зарежда | **Решение на потребителя: изтрий** ръчно след потвърждение, че WebP master-ът е достатъчен. Не е изтрито в тази задача. |
| `apps/web/public/images/recipes-web/pile-teriyaki.webp` | 228.4 KiB | Поддържан от динамичния loader и тестовете, но текущият DB slug не съвпада | **Остави** само ако ще се коригира името/slug-ът; иначе изтрий с вариантите. |
| 12 `recipes-responsive/pile-teriyaki-*` варианта | 472.5 KiB общо | Използват се само ако master-ът бъде избран | **Остави/изтрий** заедно с WebP master-а. |
| `apps/web/public/images/social/pile-teriyaki.jpg` | 131.2 KiB | Social card само при съвпадащ public recipe | **Остави/изтрий** заедно с WebP master-а. |
| `apps/web/public/images/backgrounds/blurred-food-bg.png` | 1859.9 KiB | Няма препратки в код или CSS | **Решение на потребителя: изтрий** ръчно. Не е изтрито в тази задача. |

Другите нови web assets са използвани по конвенция от responsive/social pipeline; `atmosphere.webp` и `recipe-fallback.svg` имат преки препратки. `apps/web/debug.log` остава локално и вече е игнориран; не е изтрит заради границата на задачата.

## Блокери и препоръки

1. **Чака отделна задача:** регистрационният и останалите записващи тестове да се повторят на свеж отделен Neon branch; очакването е 4/4.
2. **Анализирано:** `npm audit` — виж `docs/redesign/NPM-AUDIT-TRIAGE.md`. `next@15.5.18` блокира web publish до контролирана patch актуализация; другите две critical находки не са в web runtime.
3. **Поправено:** `.env.example`, `docs/environment.md` и `docs/local-setup.md` са актуализирани.
4. **Отложено; не блокира:** 221 PNG остават без пренаписване на историята; решението за policy cleanup е отделна задача.
5. **Извън обхвата:** `apps/mobile/README.md` остава непроменен.

## Ръчно преди deploy

- Създай restore point в Neon.
- Изтрий използвания тестов Neon branch.
- Провери в Netlify само имената: `DATABASE_URL`, `AUTH_SESSION_SECRET`, `MOBILE_JWT_SECRET`; по избор `SITE_URL`. За mobile deployment: `EXPO_PUBLIC_API_BASE_URL`.
- Вземи потребителско решение и изтрий ръчно `pile-teriyaki.png` и `blurred-food-bg.png`; тази задача не ги трие.
- Повтори записващите тестове на нов отделен branch и потвърди 4/4.
- Не публикувай web приложението, докато direct critical находката в Next не бъде patch-ната и проверена; PNG решението е отложено и не е publish blocker.
