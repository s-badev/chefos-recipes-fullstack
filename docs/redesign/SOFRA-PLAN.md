# „Софра“ — план по секции → файлове

Цел: `docs/redesign/sofra-mock.html` (тема „Софра“, тъмна). Пътищата са спрямо `apps/web/`. Логиката от стабилизацията и Етап В остава; сменя се визията.

## Стъпка 1 — основа
| Секция | Файлове | Създава / преизползва / маха |
|---|---|---|
| Токени, мрежа, шрифтове | `src/app/globals.css` (`:root`), `tailwind.config.ts` (токените; скалата `brand` към новите цветове), `src/app/layout.tsx` (Cormorant 400/500/600 + italic; сега е 300/500) | Маха палитра D и светлия фон; `.wrap` → max 1320px, отстъпи clamp(16px,4vw,56px) |
| Атмосфера | нов `src/app/atmosphere.tsx` (фиксиран слой, z-index −1), `scripts/optimize-images.mjs` (+ размит ~96px webp < 2 KB), `public/images/atmosphere.webp` | Създава |
| Шевица | нов `src/app/stitch.tsx`: `StitchBand` (SVG `<pattern>` „ромб с кука“ 16×9 в currentColor), `StitchStar` (осмолъчна, 15×15), `StitchRing` (96 + 48 бода); алгоритъмът е пренесен от макета (`bandCells`, `starSVG`, `ringSVG`, `xs`) | Създава |
| Header | `src/app/site-header-client.tsx`, `globals.css` | Преизползва auth логиката, менюто (dialog, Esc, фокус, заключен скрол), брояча; ново: 72px, плътен с `--head` + blur 14px, червено кръгче, пробив за менюто под 1000px (сега 1100px) |
| Бутони и линкове | `globals.css` (`.btn`, `.btn.solid`, `.lnk`) | Запълване отдолу при hover, стрелка, фокус 2px `--accent` (бял върху снимка) |
| Footer | `src/app/site-footer.tsx`, `globals.css` | Шевица отгоре, лого, „Разглеждай“/„Профил“, мета текстът; социалните зони 44×44 се запазват. Колоната „Макет“ от макета не влиза (тя е бележка към макета) |
| „Най-горе“ | `src/app/back-to-top-button.tsx`, `globals.css` | Логиката от Етап В остава; само стилът |
| Нередизайнвани страници | `about/page.tsx`, `profile/page.tsx`, `favorites/page.tsx`, `admin/page.tsx`, `admin/recipes/new/page.tsx`, `admin/recipes/[slug]/edit/page.tsx`, `status-view.tsx`, `catalog/(list)/loading.tsx`, `recipe-card.tsx`, `favorite-button.tsx` | Само токени: `bg-white` → `bg-surface`, `text-neutral-9xx` → `text-ink`, `border-neutral-*` → `border-line`, полета с видима рамка ≥ 3:1 и текст ≥ 4.5:1 |
| Печат | `globals.css` `@media print` | Остава светъл: бял фон и черен текст за всички елементи (новите токени са светъл текст), без атмосфера, шевица, header/footer/бутони |

## Стъпка 2 — Начало (`src/app/page.tsx` и нови компоненти)
| Секция | Файлове |
|---|---|
| Hero (`data-hero`, 100svh, два бутона, StitchBand) | `page.tsx`, `globals.css` |
| Софра (кръгла маса, 6 чинии, „Завърти“, „Избрано“) | нов клиентски `src/app/sofra-table.tsx` + нов `src/hooks/use-sofra.ts` (избор, стрелки, клавиатура); данни от `src/lib/categories.ts` (`summarizeCategories`, `categoryHref`) |
| Рецепта на седмицата | `page.tsx`; `src/lib/weekly.ts` (преизползва), `src/lib/format.ts` |
| „Какво да сготвиш днес“ (5 карти) | нов `src/lib/today.ts` (детерминистично по седмицата, без рецептата на седмицата); нов `src/app/recipe-tile.tsx` (карта: снимка, сърце, категория, заглавие, мета), споделена с каталога |
| Цитат | `src/data/landing-content.ts` (PLACEHOLDER), `page.tsx` |
| **Маха се** | `category-rail.tsx`, `src/hooks/use-rail-scroll.ts`, индексът „Съдържание“ и `#recipe-preview`, `src/lib/preview.ts` и preview логиката в `motion-root.tsx` (след като и Рецептата спре да я ползва — Стъпка 4); техните тестове се заменят с тестове за новите секции |

## Стъпка 3 — Каталог
`src/app/catalog/(list)/page.tsx`, `src/app/catalog/recipe-catalog.tsx` (визия), `src/hooks/use-catalog.ts` и `src/lib/catalog.ts` (без промяна в логиката), `recipe-tile.tsx`. Sticky лента с табове (брой като горен индекс), брояч със склонение (`foundRecipesLabel`), празно състояние, страницирането се запазва.

## Стъпка 4 — Рецепта
`src/app/catalog/[slug]/page.tsx` и `ingredient-checklist.tsx`, `recipe-favorite.tsx`, `back-to-catalog.tsx` (визия; логиката от Етап В остава), `src/lib/recipe-detail.ts`, `src/data/recipe-extras.ts`. „Следваща рецепта“: голям ред със снимка вдясно (без снимка до курсора).

## Стъпка 5 — Вход и Регистрация
Нов споделен `src/app/auth-layout.tsx` (снимка вляво, табове, заглавие, предимства със StitchStar); `login/page.tsx`, `register/page.tsx` (само изглед); `src/app/form-controls.tsx` (поле с линия отдолу, грешка под полето с `aria-describedby`, `SubmitButton` с „Влизане…“/„Създаване…“). Без промени в `src/server/auth/*`, `src/lib/auth.ts`, `src/lib/navigation.ts`.

## Къде старата визия ще се счупи на тъмен фон
- **За нас** (`about/page.tsx`, 32 светли класа): бели кутии, `text-neutral-950` (тъмен текст върху тъмен фон), `brand-*` бутони.
- **Профил** (9) и **Любими** (12): бели карти, тъмен текст, `bg-brand-600` бутони (стават почти черни).
- **Admin** (`admin/page.tsx` 34, `new` 33, `edit` 38): бели форми и таблица, полета `bg-bg` с тъмен текст, `focus:ring-brand-100`.
- **Каталог/карти** до Стъпка 3 (`recipe-catalog.tsx` 25, `recipe-card.tsx` 8), `favorite-button.tsx`.
- **404/error/loading** (`status-view.tsx`, skeleton `.sk`): ползват токени — ще се обърнат автоматично; да се провери контрастът на `--surface-hover`.
- **Печат**: `@media print` слага бял фон, но елементите с изричен `color: var(--ink)` ще станат светли върху бяло — нужен е общ черен текст в печата.
- Tailwind `brand` скалата е твърдо зададена (сиви/черни стойности) и трябва да сочи новите токени.

## Данни и отклонения, известни от Стъпка 0
- Каталогът брои **25** публични рецепти (24 подбрани + ръчната admin рецепта `/catalog/пиле-тариаки`); макетът и Начало казват 24. Eyebrow-ите ще броят от данните (подбрани за Начало; „N рецепти“ за каталога) — **изисква решение**, ако трябва да е 24 навсякъде.
- Каталогът в макета показва всички рецепти на една страница; приложението има страници по 8 — запазва се по заданието (отклонение).
- Footer колоната „Макет“ не влиза в сайта.
- `motion-mock.html` беше изтрит в работното дърво без commit; възстановен е от HEAD и маркиран „ЗАМЕНЕН“, защото заданието го изисква и тестовете от стабилизацията го ползват.
