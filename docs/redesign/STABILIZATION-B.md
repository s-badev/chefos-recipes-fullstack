# Стабилизация — отчет за Част Б

Продължение след изричното „продължи“, от `3f20d0c` върху `fix/redesign-stabilization`. Вътрешните страници запазват текущата си структура; добавени са функционалните контроли и състояния. Няма нови зависимости, промяна на Next/deployment настройки, DB схема/миграции/seed, mobile/shared или API route файлове. Съхранените imageSrc стойности и 24-те curated рецепти са непроменени. Не са започвани responsive/Lighthouse/SEO/jury одити.

## Бъг/функция → причина → поправка → проверка

App пътищата са спрямо `apps/web/`.

| Бъг/функция | Причина | Поправка | Файл | Как е проверено |
|---|---|---|---|---|
| Search и URL история | Локален component state без URL синхронизация; slug не участваше в търсенето | useCatalog: 250ms debounce, q/category в URL, refresh/back/forward, кирилица и case-insensitive slug search, clear и empty state | `src/hooks/use-catalog.ts`, `src/lib/catalog.ts`, `src/app/catalog/recipe-catalog.tsx` | Търсене `shopska`/`Таратор`, комбиниране със „Салати“, refresh, назад/напред, empty state и „Изчисти“ |
| Шест rail links | Каталогът не четеше category query | Същият hook и видим active button с aria-pressed | `src/hooks/use-catalog.ts` | Шест отделни UI теста кликат истинските home tiles и проверяват правилната категория |
| Голям client bundle | Runtime import на целия data/recipes, включително ingredients/steps | Задължителни lean CardRecipe props; server-only bounded merge на curated + manual DB records; без default curated client import | `src/lib/catalog.ts`, `src/server/recipes/catalog.ts`, `src/app/catalog/(list)/page.tsx` | Build и asset измерване; CardRecipe unit assertion; каталогът продължава да е bounded с DB pageSize 50 |
| Детайли и metadata | Нужна е проверка на всички публични адреси | Съществуващите public lookup, generateMetadata и styled notFound са запазени | `src/app/catalog/[slug]/page.tsx` | Събрани са адресите от всички страници на каталога; всички връщат 200 с title/description; uppercase slug връща styled 404; hidden scalability и unknown route тестовете минават |
| Favorites губят контекста при вход | Redirect към `/login` без next | Общ safeNextPath/loginHref; return path се пази през вход, регистрация и грешки | `src/lib/navigation.ts`, `src/server/favorites/actions.ts`, auth pages/actions | Гост натиска „Запази“ на detail → login с next → регистрация в Neon → обратно на същия detail |
| Favorite state/count след mutation | Старите forms завършваха с redirect | useFavorite/useActionState + updateFavoriteAction, pending/pressed/error state и server revalidation на layout/count | `src/hooks/use-favorite.ts`, `src/app/favorite-button.tsx`, `src/server/favorites/actions.ts`, `site-header.tsx`, `site-header-client.tsx` | Insert/delete е потвърден в Neon; 0→1→0 в header; window marker оцелява след save — няма document reload; Favorites list се обновява |
| Open redirect | next/redirectTo не бяха общо валидирани | Само вътрешни относителни `/…` paths; отхвърлени `//`, protocol, backslash, encoded separator/control и невалидно encoding; невалиден next → `/` | `src/lib/navigation.ts`, auth/favorite actions и auth pages | Pure guard матрица плюс реален login с подправен hidden `next=//evil.example`, който завършва на `/` |
| Auth validation/loading | Само основни native constraints и без pending UI | Server validators, български native validation messages, SubmitButton/useFormStatus, запазен safe next | `src/lib/auth.ts`, `src/app/form-controls.tsx`, login/register pages, `src/server/auth/actions.ts` | Невалиден имейл, реална регистрация, wrong password на български, disabled pending button, logout; guest /profile,/favorites,/admin → login; user /admin → profile |
| Admin edit променяше slug | Title edit генерираше нов slug | Запазва се текущият slug; създаването продължава да генерира уникален адрес | `src/server/recipes/repository.ts` | Admin създава тестова рецепта в Neon, редактира title/description, старият slug връща обновения detail; после UI delete и DB проверка за липса |
| Рецепта без custom image | Трябва да остане действителен image fallback | Запазен е съществуващият DB mapping към резервна снимка; добавен е web-only SVG fallback при липсващ src | `src/lib/images.ts`, `src/app/recipe-card.tsx`, detail page, `public/images/recipe-fallback.svg` | Тестовият DB record има imageUrl=null, а fallback img е реално зареден с naturalWidth>0. API/storage imageSrc не са променяни |
| Кратка рецепта на две print страници | Screen min-height:100vh плюс голямата снимка/spacing се наследяваха в print | Reset на screen shell height, компактни metadata/ingredients и пропускане на снимката само на хартия; title/products/steps остават | `src/app/globals.css` | Print media + записан A4 PDF: точно една страница за Шопска салата, без header/footer/buttons. PNG е прегледан визуално |

## Команди и изход

Преди всеки build/test са проверявани портове 3000, 3001 и 3002 чрез netstat/findstr. Заведеното от Част А приложение на PID 30388 е спряно с taskkill преди първия build. При повторните builds нашият server е спиран; не е имало едновременни dev/build процеси върху един distDir. Използвани са само build:check/start:check в `.next-check`; `.next` не е изтривана.

```text
npm.cmd run lint --workspace apps/web
> eslint . --max-warnings=0
Exit 0, без предупреждения.

npx.cmd --no-install tsc --noEmit -p apps/web
Exit 0, без изход/грешки.

npm.cmd run build:check --workspace apps/web
> node scripts/build-check.mjs
✓ Compiled successfully in 2.9s
✓ Generating static pages (23/23)
/catalog 5.33 kB; First Load JS 116 kB
Exit 0, без предупреждения.

npm.cmd run test:e2e --workspace apps/web -- functionality.spec.ts
12 passed (15.6s)

npm.cmd run test:e2e --workspace apps/web
Running 37 tests using 1 worker
37 passed (1.7m)
Exit 0.
```

Тестовете не mock-ват auth/favorites/admin data. Регистрацията създава уникален временен потребител в реалния Neon; неговият запис и favorites се проверяват чрез DB select. Admin използва съществуващия документиран demo login, но recipe create/edit/delete са действителни Neon mutations. За всеки run се създава само една уникално означена тестова рецепта и се използва съществуваща категория. Тестовият потребител и рецептата се изтриват в finally, с последващи проверки, че няма останали записи. Не се прави wildcard cleanup на реални потребителски данни. Credentials не се копират в новите файлове; auth traces са изключени.

Първият функционален run не е представян като успешен: той откри print 2-page проблема и три некоректни тестови очаквания/изчаквания. Поправени са debounce очакването, повторното попълване на изчистения login имейл и очакването за конкретен fallback filename. След това targeted и пълният run са зелени.

## Catalog chunk преди/след

Източници: build route таблицата и `.next-check/app-build-manifest.json` + точния размер на page asset. [Машинно четим запис](shots/stabilization-b/catalog-chunks.json).

| Измерване | Преди (3f20d0c) | След |
|---|---:|---:|
| Next build `/catalog` Size | 10.1 kB | 5.33 kB |
| Next build First Load JS | 121 kB | 116 kB |
| Собствен page JS asset, uncompressed | 37,999 bytes | 14,889 bytes |
| Собствен page asset, gzip | не е записан отделно | 5,338 bytes |

Raw page asset е намален с 60.82%. Тези числа не включват shared framework chunks и не са Lighthouse резултат. Full curated data/ingredients/steps вече не са client import; към каталога се подават само полетата, необходими за картите и филтрите. Public DB list остава ограничен до 50 manual records, освен 24-те curated; generated scalability records остават изключени.

## Преизползване при бъдещия редизайн

Всички пътища са спрямо `apps/web/`.

| Път / exports | Вход → изход и отговорност |
|---|---|
| `src/hooks/use-catalog.ts` — useCatalog | readonly CardRecipe[] → search/filter/page state, filtered/paginated results, clear, internal catalogHref; управлява debounce, URL и history |
| `src/lib/catalog.ts` — CardRecipe, toCardRecipe, filterCatalog | Recipe → DTO без ingredients/steps; DTO[] + q/category → filtered DTO[] |
| `src/server/recipes/catalog.ts` — getCatalogCards | без UI аргументи → bounded curated/manual CardRecipe[] от server слоя; без DB calls в JSX |
| `src/lib/categories.ts`, `src/hooks/use-rail-scroll.ts`, `src/app/category-rail.tsx` | recipe categories → encoded category links, позиция, prev/next/keyboard rail; преизползват се без промяна |
| `src/lib/navigation.ts` — safeNextPath, loginHref | unknown next → безопасен internal path или fallback; path → encoded login URL |
| `src/lib/auth.ts` — validEmail, validRegistration | входни strings → boolean; server actions остават окончателният validation/authorization слой |
| `src/app/form-controls.tsx` — SubmitButton, ValidatedInput | presentation props → pending/disabled button и български native validation messages; не съдържат DB/auth business logic |
| `src/server/auth/actions.ts` — loginAction/registerAction/logoutAction | FormData/без args → session и safe redirect; запазват next при validation errors |
| `src/server/auth/session.ts` — getCurrentUser, requireUser(next), requireAdmin(next) | session → CurrentUser, login return path или role guard; guards трябва да останат на server entrypoint-ите |
| `src/hooks/use-favorite.ts` — useFavorite | initial saved → saved/message/action/pending; useActionState lifecycle |
| `src/app/favorite-button.tsx` — FavoriteButton | slug/title/saved/redirectTo/detail → един control за card/detail; бъдещите visuals могат да се сменят отделно |
| `src/server/favorites/actions.ts` — updateFavoriteAction | previous FavoriteState + FormData → актуален FavoriteState; auth/public-recipe guard, DB mutation и RSC revalidation. Старите add/remove actions са запазени за съществуващи consumers |
| `src/server/favorites/service.ts` | текущ user/slug → favorite recipes/slugs/boolean; DB repository остава зад service слоя |
| `src/app/site-header.tsx`, `site-header-client.tsx` | CurrentUser/logout action/favoriteCount → role-aware navigation и актуален count; не изчислявайте броя от локални sample данни |
| `src/server/recipes/service.ts`, `admin-actions.ts`, `repository.ts` | FormData/slug/page → validated role-guarded CRUD и stable slug; лимитите и public-only правилата трябва да се запазят |
| `src/lib/images.ts` — webImageSrc/recipeImageSrc | stored path/липсващ path → само web rendering source; никога не записвайте WebP/SVG заместването в DB/API imageSrc |
| `src/app/print-recipe-button.tsx`, print CSS в `globals.css` | className → window.print; `.recipe-print-*`/`.no-print` са договорът за print layout |
| `src/app/not-found.tsx`, detail public lookup | непознат path/slug или hidden record → българска styled 404; не заменяйте notFound с празна 200 страница |

## Доказателства, непроверено и решения

- [Print PNG](shots/stabilization-b/shopska-print.png) — ръчно визуално прегледан; черно/бяло, четими title/products/steps, без UI меню и бутони.
- [Едностраничен A4 PDF](shots/stabilization-b/shopska-print.pdf) — page count проверен от автоматичния тест.
- Всички публични catalog detail адреси от текущите bounded данни са проверени, включително manual records. Непознатият route/slug, uppercase slug и hidden generated record имат отделни 404 проверки.
- **Непроверено:** всички произволни комбинации от query/история, всички бъдещи добавени recipes и print-ът на всяка дълга рецепта. Проверен е краткият представителен print пример; няма твърдение, че дългите рецепти се побират на една страница.
- Не е провеждан общ security/fault-injection или cross-browser audit; Playwright използва наличния Chromium. Това не отменя конкретния проверен open-redirect опит и role guards.
- Responsive/Lighthouse/SEO/jury оценките не са започвани по заданието. Не са добавяни curtain/favorites анимации или нов дизайн на вътрешните страници.
- **Изисква решение:** няма блокиращо решение за завършената Част Б. След този отчет работата спира; следващ редизайн не е започнат.

## Commit-и и сървър

- `409dfda` — URL-driven каталог и lean client data.
- `69591c4` — auth validation, безопасни return paths и loading controls.
- `cc869e1` — favorites без redirect/reload, live count и web fallback.
- `629c689` — stable admin slug и print compact layout.
- Тестовете, PDF/PNG, chunk evidence и този отчет са в последващия отделен test/documentation commit; неговият hash е във финалния отговор.

Накрая работи само `npm.cmd run start:check --workspace apps/web -- -p 3000`, от `.next-check`, PID **30484**, на **http://localhost:3000/**. Няма push, PR, merge или deploy.
