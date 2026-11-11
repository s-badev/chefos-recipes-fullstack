# Етап Б — Landing и визуална основа

## Обхват и Git

Заварено: `feat/editorial-redesign`, HEAD `4dbf83c`, правилен origin и единствен непроследен файл `docs/redesign/motion-mock.html`. Първият commit е само макетът: `d70955b`.

Implementation commits:

- `d8eeeb3` — WebP pipeline, 26 изображения, manifest, web-only image resolver и Next image formats.
- `1b18d94` — палитра, шрифтове, shell, header/footer, достъпно меню и motion island.
- `440a4df` — Landing, седмичен избор, server-rendered word spans, неутрални стилове на съществуващите страници и unit проверки.
- `81a18b3` — AA контраст на вторични labels/placeholder-и, само transform transitions в legacy presentation класовете и mobile index spacing по макета.
- `b481ba8` — видим hero caption още преди mobile scroll и непрозрачни semantic surfaces за четими badges/favorite controls. Премахнати са unsupported `/opacity` modifiers върху hex CSS-variable цветове в Tailwind 3.

Всичко е локално върху task branch. Няма push, PR, merge или deploy. Няма инсталирани зависимости. `.env` файлове не са отваряни.

## Файлове

Променени: `apps/web/next.config.js`, `tailwind.config.ts`; `src/app/{globals.css,layout.tsx,page.tsx,site-header-client.tsx,site-footer.tsx,back-to-top-button.tsx,recipe-card.tsx}`; само presentation класове в About, Catalog, Recipe Details, Login, Register, Profile, Favorites и трите Admin страници. RecipeCard и Recipe Details използват web image resolver.

Добавени:

- `src/app/{page-shell.tsx,motion-root.tsx,split-heading.tsx}`.
- `src/app/{about,admin,catalog,favorites,login,profile,register}/layout.tsx` — един PageShell за всеки non-landing route tree, включително вложените admin/detail страници.
- `src/lib/{images.ts,web-images.json,weekly.ts,landing-content.ts}`.
- `scripts/{optimize-images.mjs,test-editorial.mjs,verify-editorial-browser.mjs}`.
- 26 файла в `public/images/recipes-web/`.
- Макет, този отчет и screenshots/results в `docs/redesign/`.

Изтрити файлове: няма. Оригиналните PNG и съхранените `imageSrc` са непроменени. Няма промени в server/API/auth/favorites/admin логика, mobile, shared, DB или deployment конфигурация.

## Премахнато от предишната визия

Inter/Playfair са заменени с Onest/Cormorant. Кремавите/теракотени токени и оранжевата `brand` скала са заменени с неутрални стойности. Запазени са полезните semantic aliases, но сочат към новата палитра. Премахнати са старите декоративни component gradients, топлите inline цветове, card shadows и големите заобляния; main controls са правоъгълни. Landing вече няма badge, stat tiles, featured card grid, старите CTA и 01–04 capability блока. `.hero-food-visual` и цветните fallback gradients вече не се използват; fallback-ът е неутрален. Blurred PNG е оставен физически, без CSS употреба. Оригиналният print CSS е сравнен с `4dbf83c` и е запазен дословно след нормализиране на line endings.

## Пренасяне на макета и разлики

CSS за hero, cover, rail, quote, index, buttons, masks и reveals е пренесен от одобрения HTML. Реализирани са един IntersectionObserver и един requestAnimationFrame loop. Layout не създава stacking context над cover blend елементите; mask е върху `.mk`, а не върху наблюдавания target. Word spans са готови в server HTML. React прегледът насочи имплементацията към server-rendered съдържание и малки client islands с cleanup на observers/listeners/timers.

Разлики спрямо самостоятелния макет:

1. Реални снимки и 24 curated рецепти вместо рисувани/sample данни. Hero използва изрично поисканата снимка с баница и салата; crop е адаптиран за двата breakpoint-а. Rail съдържа шестте реални категории. Index следва реалния curated ред.
2. Cover е детерминистичен по UTC ISO седмица; номерът е действителната позиция в curated списъка. Зададен е `revalidate = 3600`. Общият header продължава да чете auth cookies, затова Next отчита страницата като dynamic; не е променяно персонализирането на header-а заради кеширане.
3. Запазени са съществуващите guest/user/admin навигация, „Каталог“, поздрав, logout и всички footer/social links. Макетният брояч „Любими 1“ не се показва фиктивно на гости.
4. На тесни екрани има full-screen modal menu с Tab/Shift+Tab trap и Esc. Без JavaScript се показват четими, хоризонтално превъртащи се nav links и solid header — достъпен fallback без scroll JS. Serif логото е 28px за зададения минимум.
5. Scrim-ът в горния край на hero и под rail labels е усилен за четимост. Rail има 6px допълнително място за focus outline. Всички фокусируеми елементи, включително rail, имат 3px outline. Невидимият back-to-top не участва в tab реда; reduced-motion изключва и smooth scroll.
   Мобилният hero caption се разкрива от наблюдението на самия hero, за да не остава скрит под отрицателния observer margin до първия scroll.
6. Solid бутонът обръща цветовете при hover за видима реакция; основните motion transitions анимират само transform/opacity/clip-path. Старите страници са неутрализирани, без да получават бъдещите си mock layouts.
7. Макетните контроли, curtain transitions, mock favorites state и бележките за sample текст не са пренесени. Това следва изрично зададения обхват. Quote текстът е само в `landing-content.ts` с owner replacement comment.
8. Image existence се определя от generated manifest, проверен срещу реалните файлове. Това позволява един и същ чист resolver да работи в server и client web компоненти; непознатите/admin paths остават непроменени.

## Изображения

26 PNG: **217,424,819 bytes** → 26 WebP: **7,479,180 bytes**, **96.56%** намаление. Максимална ширина 2000px, quality 82, запазена пропорция, премахнати metadata. Само hero е priority; останалите Landing изображения са lazy и имат sizes и резервирана геометрия.

## Проверки

- `npm.cmd run build --workspace apps/web`: успешен, включително TypeScript. Съществуващи предупреждения: остарял `caniuse-lite`; липсващ ESLint, поради което build не изпълнява lint. Не е инсталирано нищо и не е стартиран отделен lint.
- `node apps/web/scripts/test-editorial.mjs`: успешен — ISO week-year граници, седмичен избор, image fallback и проверка на 26 WebP файла.
- Production browser results: [shots/stage-b/results.json](shots/stage-b/results.json). Headless Chrome, `next build` + `next start`, локална машина, без CPU/network throttling. Това са локални browser измервания, а не Lighthouse/field показатели.
- Хоризонтално преливане: 0 при 390, 768 и 1440. H1: 62.72px, 88.52px, 134.39px.

| Landing viewport | Overflow | CLS | LCP без throttling |
|---|---:|---:|---:|
| 390 × 844 | 0px | 0 | 1912ms |
| 768 × 900 | 0px | 0 | 52ms |
| 1440 × 900 | 0px | 0 | 72ms |

- Skip link, Tab ред и видим focus, modal focus trap/Esc, rail Tab/ArrowRight: проверени. Търсене „Таратор“: 8 карти → 1.
- Reduced motion: `data-motion=off`, без Ken Burns и скрити reveal елементи. Без JS: heading, 6 категории и 8 index реда са видими, няма анимация и overflow; навигацията е достъпна.
- Print emulation на `/catalog/shopska-salata`: бял body, тъмен текст, скрити header/footer, налични продукти и 3 print sections. Screenshot: `shots/stage-b/recipe-print.png`.
- `/register`: 200; `/profile`, `/admin`, `/favorites`: 307 към `/login` за гост. Всички screenshot routes са 200. Единствената browser HTTP грешка е съществуващият `/favicon.ico` 404; няма font/image 404.
- Временният dev HMR проблем в Recipe Details не се възпроизвежда в production проверката. При завършване dev сървърът се стартира наново.

Lighthouse не е наличен: Performance mobile/desktop **не е измерен**, следователно целта ≥90 не е доказана. Authenticated User/Admin flows, logout, запис/изтриване на favorites и admin CRUD не са изпълнявани с реален акаунт; server логиката им е непроменена. Не е извършен автоматичен пикселен контрастен одит на динамичния `mix-blend-mode:difference` върху корицата; математическите проверки по-долу са за токените и scrim regions.

## Контраст

WCAG relative luminance, sRGB. Line е декоративен hairline и не се използва като foreground за текст.

| Текст / фон | Контраст |
|---|---:|
| ink / bg | 15.52:1 |
| muted / bg | 6.77:1 |
| accent-ink / accent | 15.52:1 |
| deep-ink / deep | 15.52:1 |
| deep-accent / deep | 15.52:1 |
| ink / white surface | 18.88:1 |
| muted / white surface | 8.24:1 |
| white / 60% black scrim over white | 5.74:1 |
| white large headline / 44% black scrim over white | 3.23:1 |

Последните два реда са консервативни граници за областите с текст при проверените hero/rail композиции, а не за целия scrim. Малките текстове остават в по-тъмните му области. Placeholder-ите и вторичните legacy labels използват muted, за да останат над 4.5:1.

## Снимки и възпроизводимост

Преди code edits: шестте mock views при 1440/390, first screen + full page, в `shots/reference/` (24 PNG).

Окончателни: Landing при 390/768/1440, first screen + full page; Catalog, Recipe Details, About, Login при 390/1440; допълнителни no-JS и print снимки в `shots/stage-b/`. Preview-ите могат да се сравняват с reference, без да се очакват идентични sample данни/рисунки.

Команди:

```powershell
node apps/web/scripts/test-editorial.mjs
npm.cmd run build --workspace apps/web
npm.cmd run start --workspace apps/web -- --hostname 127.0.0.1 --port 3020
node apps/web/scripts/verify-editorial-browser.mjs stage-b http://127.0.0.1:3020
```

Browser script използва вече наличния Windows Chrome; не инсталира browser или пакети. Финален dev адрес: **http://localhost:3001/** (`npm.cmd run dev:web`; порт 3000 вече е зает).
