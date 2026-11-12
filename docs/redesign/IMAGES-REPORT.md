# Снимки — транслитерация и локална поправка на ✦

Branch `feat/redesign-sofra`, начало `3f626b4`. Без DB записи/Neon-write тестове, нови зависимости, API/mobile/shared/schema/env/deployment промени, push, PR, merge или deploy. PNG оригиналите и непознатият untracked `sofra-mock-pages.html` са непокътнати. Предишният отчет е в git на `3f626b4`; артефактите в `shots/images/` са запазени.

## 1. Транслитерация и web снимка

Готова транслитерация не беше намерена. Добавена е чиста `src/lib/transliteration.ts`: зададените съответствия, NFC (запазва й), малки букви и интервали → тирета. Пунктуацията не се скрива/изтрива, за да може path guard да я отхвърли.

Сравнение на **заглавията** с действителните имена на оригиналите; **24/24 съвпадат, несъвпадения няма**. В последната колона „да“ означава и че файлът съществува. [JSON](shots/images-followup/transliteration.json).

| Заглавие | Транслитерация + .png | Съществуващ файл | Съвпада |
|---|---|---|---|
| Шопска салата | shopska-salata.png | shopska-salata.png | да |
| Баница със сирене | banitsa-sas-sirene.png | banitsa-sas-sirene.png | да |
| Кавърма със свинско | kavarma-sas-svinsko.png | kavarma-sas-svinsko.png | да |
| Таратор | tarator.png | tarator.png | да |
| Пълнени чушки с ориз | palneni-chushki-s-oriz.png | palneni-chushki-s-oriz.png | да |
| Миш-маш | mish-mash.png | mish-mash.png | да |
| Боб чорба | bob-chorba.png | bob-chorba.png | да |
| Тиквеник | tikvenik.png | tikvenik.png | да |
| Крем карамел | krem-karamel.png | krem-karamel.png | да |
| Сладък салам | sladak-salam.png | sladak-salam.png | да |
| Баклава с орехи | baklava-s-orehi.png | baklava-s-orehi.png | да |
| Мусака с картофи | musaka-s-kartofi.png | musaka-s-kartofi.png | да |
| Пилешка супа | pileshka-supa.png | pileshka-supa.png | да |
| Пържени филийки | parzheni-filiyki.png | parzheni-filiyki.png | да |
| Сарми с кисело зеле | sarmi-s-kiselo-zele.png | sarmi-s-kiselo-zele.png | да |
| Снежанка | snezhanka.png | snezhanka.png | да |
| Овчарска салата | ovcharska-salata.png | ovcharska-salata.png | да |
| Зелева салата | zeleva-salata.png | zeleva-salata.png | да |
| Баница с праз | banitsa-s-praz.png | banitsa-s-praz.png | да |
| Мекици | mekitsi.png | mekitsi.png | да |
| Тутманик | tutmanik.png | tutmanik.png | да |
| Шкембе чорба | shkembe-chorba.png | shkembe-chorba.png | да |
| Омлет със сирене | omlet-sas-sirene.png | omlet-sas-sirene.png | да |
| Сирене по шопски | sirene-po-shopski.png | sirene-po-shopski.png | да |

`src/server/recipes/web-image.ts` проверява само публично подадени manual recipes без собствена снимка. Guard на raw slug преди I/O, после guard `^[a-z0-9-]+$` върху транслитерацията. Асинхронен `stat`, кеширани положителни/отрицателни Promise резултати, максимум 256 ключа; грешки извън ENOENT/ENOTDIR не се скриват. Кешира се само съществуване на файл, без recipe/user данни. Сървърните `catalog.ts` и `web-details.ts` подават разрешения imageSrc към картите и hero/metadata; FS кодът не влиза в client bundle. Build traces за catalog/detail включват `pile-teriyaki.webp`.

`RecipeTile` се използва от Каталог и Начало; новите снимки получават alt **„Снимка на <заглавие>“**. Начало в момента избира само от curated 24 — manual рецептата не попада там и подборът не е променян. Същият компонент е проверен с mock manual recipe и return path `/`.

Генериран е `pile-teriyaki.webp`, **1448×1086, 233,920 bytes**, през `optimize-images.mjs --only=pile-teriyaki.png`. Детектор: няма знак, confidence 0.204, няма изрязване. PNG остава untracked. [Generation JSON](shots/images-followup/generation-pile-teriyaki.json). Каналът вече включва новите PNG при обикновено стартиране, запазва съществуващ master без знак и обновява manifest от действителните WebP файлове.

**Избор на собственика: само строга транслитерация, без alias.** Read-only repository заявката още връща „Пиле Тариаки“, slug `пиле-тариаки` → **`pile-tariaki`**. Предоставеният файл/мастер е **`pile-teriyaki`**. Затова реалният запис остава с StitchStar; няма автоматична правописна поправка или DB промяна. Mock recipe със slug `пиле-терияки` показва реално заредения master и на tile, и на hero; съществуващият грешен slug е отделен отрицателен пример.

**Правило за собственика:** „Нова рецепта от админа: сложи PNG с име <транслитерация на заглавието>.png в apps/web/public/images/recipes/ и пусни optimize-images“.

Команда: `node apps/web/scripts/optimize-images.mjs` или само новия файл с `--only=<име>.png`, после build/рестарт на приложението за обновяване на FS кеша. Сървърът търси по **запазения slug**. Ако той се различава от заглавието, името на PNG трябва да следва транслитерацията на slug-а. Текущият repository използва NFKD при създаване и например превръща й в и; редакция на заглавието също не променя стария slug. Не е променяна тази DB/API логика.

Основни файлове: `src/lib/transliteration.ts`, `src/server/recipes/web-image.ts`, `web-details.ts`, `catalog.ts`, detail page, `recipe-tile.tsx`, `web-images.json`, `scripts/optimize-images.mjs`, `report-transliteration.cjs`, `tests/web-images.spec.ts` и новият WebP.

## 2. Седемте локални поправки

Следва в отделния commit след визуален преглед на кандидатите. Първоначалните седем masters още са непроменени в commit-а за Част 1.

## Проверки

Част 1: lint и tsc — Exit 0; build:check — compiled in **3.2s**, **23/23**, Exit 0, без предупреждения. Новите repository-mock/unit/UI тестове — **5 passed (1.7s)**. Общото повторение: **89 passed (2.5m)**, Exit 0; axe **0 нарушения на седем страници** (`/`, `/catalog`, двете рецепти shopska-salata/пиле-тариаки, `/login`, `/register`, `/about`).

Точно четирите сценария със записи в Neon са изключени чрез `--grep-invert "real Neon registration|real Neon admin|favourite: a guest|admin recipe on the substitute image"`; всички други се изпълняват. Не са променяни/skip-вани тестовете, за да се прикрива неуспех. Първият общ run имаше 88 passed/1 failed в стария debounce тест (`q=shopska` не се обнови). Отделното повторение мина; общият suite се повтори без промяна по търсенето.

**Непроверено:** реална DB mutation, други browser-и/DPR, production/Netlify deploy. Няма обобщен responsive/Lighthouse/SEO одит. Положителната manual recipe е mock на repository слоя, не създаден запис в Neon.
