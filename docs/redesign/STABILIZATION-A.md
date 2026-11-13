# Стабилизация — отчет за Част А

Изходно състояние: `fix/redesign-stabilization`, HEAD `a45e500`, правилен GitHub origin. Заварени са точно осем променени app файла. Diff-ът съответства на одобрения списък с текстове; няма предварителни промени извън него за връщане. Текстовете на 24-те рецепти са непроменени.

Част Б **не е започната**. Не са извършвани responsive/SEO/jury одит или Lighthouse измерване. Вътрешните страници не са редизайнвани.

## Бъгове и доказателства

Всички app пътища в таблицата са спрямо `apps/web/`.

| Бъг/функция | Причина | Поправка | Файл | Как е проверено |
|---|---|---|---|---|
| Одобрени текстове и единствено число | Остарели фрази и безусловно множествено число | Прелисти, одобрените About/Register/metadata текстове; използвани съществуващите format helpers | `src/app/{page.tsx,layout.tsx,about/page.tsx,register/page.tsx,login/page.tsx,catalog/recipe-catalog.tsx,category-rail.tsx}` | Diff по одобрения списък; helper assertions за 0/1/2 и `01 рецепта`; реално търсене „Таратор“ показва `1 намерена рецепта` |
| Поздрав за админ без име | Email префиксът се връщаше преди admin fallback | След празно име admin получава „администратор“ | `src/app/site-header-client.tsx` | Преглед на условието и TypeScript; реален login с безименен admin е непроверен до Част Б |
| Мобилна навигация в макета | Desktop links се опитваха да останат на един тесен ред | Под/на 1100px: Menu toggle, native modal dialog, едри serif links, Tab/Shift+Tab trap, Esc, close-on-select и връщане на фокуса | `docs/redesign/motion-mock.html` | App и mock menu tests при 390/768; screenshots `*-menu-{390,768}.png`; сравнения при 1440 |
| Пренасяне на „Nº NN“ | Колоната 40px позволяваше пренасяне по интервала | `white-space: nowrap` в app и макета | `src/app/globals.css`, `docs/redesign/motion-mock.html` | Осемте реда са с височина не повече от един line-height при 390/768/1440 и на двете повърхности |
| Посока на reveal на preview | Първоначален bottom inset 100% разкриваше отгоре надолу | Начален top inset 100%, целият контейнер остава 300×225; анимира се clip-path | `src/app/globals.css`, mock | Междинният transition кадър е паузиран на 80ms; частичен top inset, размер 300×225; след появата clip-path е `inset(0px)` |
| Наклон и излизане от екрана | ±8°; clamp само на незавъртяната снимка и `innerWidth`, включващ scrollbar | Максимум ±4°; запазено място за целия завъртян bounding box, 8px от видимия край и clientWidth/clientHeight | `src/lib/preview.ts`, `src/app/motion-root.tsx`, mock | По 60 rAF кадъра за app и mock: max tilt 4°, outside 0 |
| Preview върху активния ред | Lerp между безопасни крайни точки може да мине през новия ред; below target можеше да бъде clamp-нат върху него | Безопасна зона над/под целия ред, gap 16px; междинният кадър се мести на безопасната страна; ако няма място, preview не се показва | Същите файлове | Снимки за редове 1/4/8; overlap 0 във всички 120 измерени кадъра; pure helper тест за невъзможен viewport |
| Reduced-motion / non-hover | Необходима е гаранция и при смяна на media preference | Preview не се показва; transform се изчиства; следенето и наклонът са изключени | `src/app/motion-root.tsx`, mock | Отделен тест и за app, и за mock при reduced-motion и touch/non-hover |
| Header след hero | Проверено съмнение за изместване или отрязано лого | Не е намерен дефект; header CSS не е променян | Съществуващите header и logo класове | При 390/1440 и scroll 900/2400: position=fixed, top=0, kicker изцяло между top/bottom на header; 4 screenshots |

Геометрията на preview е отделена в чисти функции. MotionRoot запазва един observer и един rAF loop, с cleanup на media listeners. Row bounds и viewport се четат при enter/resize; няма layout reads в scroll handler. Това следва и React прегледа за малки client islands и transient DOM състояние без излишни React render-и.

## Команди и изход

Преди lint/tsc/build/test са изпълнявани:

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

Завареният node server на :3000, PID **29508**, е спрян по заданието:

```text
taskkill /PID 29508 /T /F
SUCCESS: The process with PID 29508 (child process of PID 16044) has been terminated.
```

Всички builds са само чрез `build:check` в `.next-check`; `.next` не е изтривана или презаписвана чрез build. Преди повторен build нашият verification server е спиран. Работи само един server.

Финални проверки след app/mock/test промените:

```text
npm.cmd run lint --workspace apps/web
> eslint . --max-warnings=0
Exit 0; няма предупреждения.

npx.cmd --no-install tsc --noEmit -p apps/web
Exit 0; няма изход/грешки.

npm.cmd run build:check --workspace apps/web
> node scripts/build-check.mjs
✓ Compiled successfully in 2.6s
✓ Generating static pages (23/23)
Exit 0; няма предупреждения.

$env:STABILIZATION_SHOTS='1'
npm.cmd run test:e2e --workspace apps/web
Running 25 tests using 1 worker
25 passed (1.6m)
Exit 0.
```

Първият copy checkpoint също е проверен отделно: lint/tsc/build:check успешни и съществуващите 14/14 Playwright теста успешни. В първия test run имаше средово NO_COLOR/FORCE_COLOR предупреждение; последният run премахва само дублирания NO_COLOR флаг от средата на командата и е без него. Не са редактирани `.env` файлове.

## Скрийншоти

Папка: [shots/stabilization-a](shots/stabilization-a/), **34 PNG** плюс 2 geometry JSON файла.

- `home-{390,768,1440}-side-by-side.png` и `about-{390,768,1440}-side-by-side.png`: макет **вляво**, приложение **вдясно**. Отделните `*-mock.png` и `*-app.png` са оригиналите.
- `app-menu-{390,768}.png`, `mock-menu-{390,768}.png`: full-screen менюта.
- `header-{390,1440}-scroll-{900,2400}.png`: четирите header доказателства след приключване на reveal анимациите.
- `app-preview-mid-reveal.png`, `mock-preview-mid-reveal.png`: междинна поява без преоразмеряване на снимката.
- `{app,mock}-preview-row-{1,4,8}.png`: начало, среда и край на списъка.
- `{app,mock}-preview-measurements.json`: кадри, ъгъл, граници и припокриване.

Сравненията не са твърдение за пикселна идентичност на вътрешните страници: About предстои да бъде изградена по макета. Макетът запазва sample данните/рисунките и собствените си контроли; приложението има реалните снимки, шест curated категории, седмична рецепта и auth-aware навигация. Sample recipe масивът в макета и app рецептите не са променяни в Част А.

## Какво да се преизползва в следващите етапи

Това е инвентар на съществуващия код, не отчет за завършена Част Б. Пътищата са спрямо `apps/web/`.

| Компонент / функция | Вход → изход / отговорност |
|---|---|
| `src/app/catalog/recipe-catalog.tsx` — RecipeCatalog | recipes/favoriteSlugs props → клиентски каталог. Search/category/page състоянието е тук; отделянето на hook, debounce, URL/history и slug search остава за Част Б |
| `src/lib/categories.ts` — summarizeCategories / categoryHref | Recipe[] → категории с брой/снимка; име → `/catalog?category=…` |
| `src/app/category-rail.tsx`, `src/hooks/use-rail-scroll.ts` | категории/heading и rail ref → tiles, позиция, prev/next и keyboard scrolling; не обвързвайте тези функции с бъдещата визия на каталога |
| `src/server/recipes/service.ts` — listPublicCatalogRecipes / getPublicCatalogRecipeBySlug | pagination / slug → ограничена публична страница / публична рецепта или липса; запазва се разграничението curated/manual спрямо hidden scalability records |
| `src/server/favorites/actions.ts` — addFavoriteAction / removeFavoriteAction | FormData → съществуваща favorite mutation/navigation; auth return/next и live counts предстоят да се проверят/поправят в Част Б |
| `src/server/favorites/service.ts` — getCurrentUserFavoriteSlugs / getCurrentUserFavoriteRecipes / isCurrentUserFavoriteRecipe | текуща сесия, optional slug → slugs / recipes / boolean; repository слоят остава под тях |
| `src/server/auth/actions.ts` — loginAction / registerAction / logoutAction | FormData или без аргументи → session промяна и redirect. URL return path/open redirect защита не са реализирани като част от тази задача |
| `src/server/auth/session.ts` — getCurrentUser / requireUser / requireAdmin / createSession / clearSession | сесия/CurrentUser → потребител, role guard или cookie промяна; не пренасяйте проверки за роли в presentation JSX |
| `src/server/recipes/admin-actions.ts` — createRecipeAction / updateRecipeAction / deleteRecipeAction | FormData → администраторска mutation; действителен Neon CRUD тест остава за Част Б |
| `src/app/print-recipe-button.tsx`, print CSS в `src/app/globals.css` | optional className → `window.print()`; `.recipe-print-*` / `.no-print` определят print presentation и трябва да се запазят при новия detail layout |
| `src/app/not-found.tsx` | Next notFound boundary → стилизирана българска 404; съществуващите route/hidden-record тестове минават |
| `src/app/site-header-client.tsx` — SiteHeaderClient | CurrentUser и logoutAction → role-aware links, поздрав и достъпно modal меню |
| `src/lib/preview.ts` — previewTarget / safePreviewStep | row bounds, pointer/viewport и позиция → safe point или null; чиста геометрия, независима от снимки/JSX |
| `src/app/motion-root.tsx` — MotionRoot | текущ route/media preferences → reveals/parallax/preview; запазени са съществуващите fail-safe и reduced-motion правила |

## Непроверено / изисква решение

- **Непроверено и умишлено отложено:** реалните Neon auth/favorites/admin CRUD сценарии, open redirect опити, search/filter/history функционалността и print проверките от Част Б. Не са извършвани DB mutations в Част А.
- Реално влизане като admin без име не е изпълнявано; fallback е проверен чрез кода, lint и TypeScript.
- Не е правен общ responsive одит, Lighthouse, SEO или jury оценка. Трите ширини са само изрично поисканите доказателства за Част А.
- **Изисква решение:** няма блокиращо продуктово решение за Част А. Следващото действие е изричното „продължи“ за Част Б; дотогава работата спира.

## Commit-и и финален сървър

- `55c34d3` — одобрени български текстове, отделен commit.
- `fe41573` — preview geometry и номера без пренасяне.
- Макетът, screenshot доказателствата, новите тестове и този отчет са в следващия отделен documentation/test commit; неговият hash е във финалния отговор.

Накрая работи един production verification server: `npm.cmd run start:check --workspace apps/web -- -p 3000`, distDir `.next-check`, **http://localhost:3000/**, PID **30388**. Няма push, PR, merge или deploy; dependencies/Next/deployment/API/DB/mobile/shared не са променяни.
