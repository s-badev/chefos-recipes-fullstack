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

Генерирани са седем кандидата с копиране на съседна текстура и feather маска. Донорът се избира по цвета на граничния пръстен; ограничена корекция на RGB и при двата дървени кандидата с различен фокус — лек blur **само на донорната текстура**. След преглед на увеличенията на всички седем и целия кадър на приетия кандидат е приложен **само тиквеникът**. Другите шест имат видим дефект и **не са записани в публичните мастери**, както изисква заданието. Собственикът решава за тях; таблицата води към предложението, а не към приложена поправка.

| Снимка | Решение и причина | Цял кадър JPEG | Увеличение JPEG |
|---|---|---|---|
| banitsa-s-praz | Не е приложена — прекъсване на синьо/червения мотив | [преди/кандидат](shots/images-followup/texture/banitsa-s-praz-full.jpg) | [увеличение](shots/images-followup/texture/banitsa-s-praz-zoom.jpg) |
| hero-banitsa-shopska-salad | Не е приложена — нарушени червена/черна линии | [преди/кандидат](shots/images-followup/texture/hero-banitsa-shopska-salad-full.jpg) | [увеличение](shots/images-followup/texture/hero-banitsa-shopska-salad-zoom.jpg) |
| palneni-chushki-s-oriz | Не е приложена — различна посока/рязкост на дървесината | [преди/кандидат](shots/images-followup/texture/palneni-chushki-s-oriz-full.jpg) | [увеличение](shots/images-followup/texture/palneni-chushki-s-oriz-zoom.jpg) |
| sarmi-s-kiselo-zele | Не е приложена — видимо различен фокус на текстурата | [преди/кандидат](shots/images-followup/texture/sarmi-s-kiselo-zele-full.jpg) | [увеличение](shots/images-followup/texture/sarmi-s-kiselo-zele-zoom.jpg) |
| shopska-salata | Не е приложена — нарушени цвете и черна линия | [преди/кандидат](shots/images-followup/texture/shopska-salata-full.jpg) | [увеличение](shots/images-followup/texture/shopska-salata-zoom.jpg) |
| tikvenik | **Приложена** — не се вижда шев при прегледа | [преди/след](shots/images-followup/texture/tikvenik-full.jpg) | [увеличение](shots/images-followup/texture/tikvenik-zoom.jpg) |
| tutmanik | Не е приложена — прекъсната шарка на плата | [преди/кандидат](shots/images-followup/texture/tutmanik-full.jpg) | [увеличение](shots/images-followup/texture/tutmanik-zoom.jpg) |

Всички **14 JPEG са quality 80**. При тиквеника маската е в правоъгълник `(1850,1344,112,112)`, донорът е `(1638,1372,112,112)`. Променени са **4326 пиксела (~0.145%)**; всички декодирани RGB пиксели извън feather маската са точни копия на предишния master. За това е използван **lossless WebP**: 336,764 → 2,585,556 bytes. Това увеличава файла на мастера; картите продължават да получават оптимизираните Next варианти, не целия master. Размерите 2000×1493, съдовете и останалият кадър са запазени. Останалите 26 мастера са byte-for-byte непроменени спрямо commit-а за Част 1. PNG оригиналите са проверени по SHA-256.

Код: `scripts/texture-repair.mjs`, `repair-image-marks.mjs`, `texture-repair-review.json`, `preview-texture-donors.mjs`; прилагане през **`node apps/web/scripts/optimize-images.mjs --repair-marks`**. Кандидатите минават checksum, detector и визуален review преди запис. Повторното прилагане на вече записаната поправка е идемпотентно. [Параметри/хешове/резултати](shots/images-followup/texture/repairs.json). Прегледът е агентски, не е представян като одобрение от собственика.

### Повторен детектор върху всичките 27 мастера

Алгоритъмът и прагът 0.37 от Част А са непроменени. Confidence е корелация, не вероятност. **21 без засечен знак, 6 със запазен знак, 0 неочаквани**. Наличието на шестте е изрично показано, а не скрито зад общ „PASS“. [JSON](shots/images-followup/texture/recipes-web-marks.json).

| Master .webp | ✦ след | bbox x,y,w,h | Confidence |
|---|---|---|---:|
| baklava-s-orehi | не | — | 0.245 |
| banitsa-s-praz | да | 1869,1362,75,75 | 0.578 |
| banitsa-sas-sirene | не | — | 0.155 |
| bob-chorba | не | — | 0.282 |
| hero-banitsa-shopska-salad | да | 1874,1367,65,65 | 0.586 |
| kavarma-sas-svinsko | не | — | 0.194 |
| krem-karamel | не | — | 0.203 |
| kyufteta-na-skara | не | — | 0.186 |
| mekitsi | не | — | 0.145 |
| mish-mash | не | — | 0.319 |
| musaka-s-kartofi | не | — | 0.299 |
| omlet-sas-sirene | не | — | 0.156 |
| ovcharska-salata | не | — | 0.266 |
| palneni-chushki-s-oriz | да | 1874,1367,65,65 | 0.642 |
| parzheni-filiyki | не | — | 0.128 |
| pile-teriyaki | не | — | 0.179 |
| pileshka-supa | не | — | 0.174 |
| sarmi-s-kiselo-zele | да | 1861,1354,90,90 | 0.791 |
| shkembe-chorba | не | — | 0.164 |
| shopska-salata | да | 1874,1367,65,65 | 0.581 |
| sirene-po-shopski | не | — | 0.165 |
| sladak-salam | не | — | 0.368 |
| snezhanka | не | — | 0.287 |
| tarator | не | — | 0.167 |
| tikvenik | не | — | 0.286 |
| tutmanik | да | 1861,1347,90,90 | 0.371 |
| zeleva-salata | не | — | 0.161 |

## Проверки

Част 1: lint и tsc — Exit 0; build:check — compiled in **3.2s**, **23/23**, Exit 0, без предупреждения. Новите repository-mock/unit/UI тестове — **5 passed (1.7s)**. Общото повторение: **89 passed (2.5m)**, Exit 0; axe **0 нарушения на седем страници** (`/`, `/catalog`, двете рецепти shopska-salata/пиле-тариаки, `/login`, `/register`, `/about`).

Точно четирите сценария със записи в Neon са изключени чрез `--grep-invert "real Neon registration|real Neon admin|favourite: a guest|admin recipe on the substitute image"`; всички други се изпълняват. Не са променяни/skip-вани тестовете, за да се прикрива неуспех. Първият общ run имаше 88 passed/1 failed в стария debounce тест (`q=shopska` не се обнови). Отделното повторение мина; общият suite се повтори без промяна по търсенето.

**Непроверено:** реална DB mutation, други browser-и/DPR, production/Netlify deploy и бъдещи watermark позиции/композиции. Детекторът остава калибриран за познатия долен десен знак. Няма обобщен responsive/Lighthouse/SEO одит. Положителната manual recipe е mock на repository слоя, не създаден запис в Neon.

Част 2: lint/tsc — Exit 0; финален build:check — compiled in **1872ms**, **23/23**, Exit 0, без предупреждения. Новите texture проверки — **4 passed (6.6s)**: реалните master пиксели спрямо предишния git blob, 14-те JPEG, същият detector и AVIF card отговор под 150 KB. Финален общ run след поправката на hydration race: **94 passed (2.6m)**, Exit 0; **axe 0 нарушения на седемте страници**. Командите за suite-а са същите като при Част 1; не се пускат четирите write сценария. Средовото NO_COLOR/FORCE_COLOR предупреждение на Playwright не е build предупреждение.

Проверките откриха и възпроизводим стар hydration race: при run-а за Част 2 **92 passed/1 failed**, отново в debounce. В `src/hooks/use-catalog.ts` history флагът вече пропуска ефекта само ако state още съвпада с URL; по-ново въвеждане не се поглъща. Дизайнът е непроменен. Новият `tests/catalog-hydration.spec.ts` контролира точно реда mount → въвеждане → effect: **проваля се със стария guard** (`q` липсва) и **минава с поправката**. Старият debounce тест не е променян. Тази малка поправка се записва отделно от image обработката.

Commit за Част 1: **44f77ad**; отделна hydration поправка: **83a2163**. Хешът за Част 2 е във финалния отговор. Последният verification server PID **14024** е спрян след проверките; няма listener на 3000/3001/3002. Двата предоставени untracked файла — PNG и макетът — остават извън commit-ите.
