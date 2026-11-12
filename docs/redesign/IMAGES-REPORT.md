# Снимки — А и Б; В спряна заради slug

Branch `feat/redesign-sofra`, изходна точка `3e97609`. Без зависимости, DB записи, schema/migrations/seed, API/mobile/shared, .env или deployment промени. Без push/PR/merge/deploy. Дизайнът, CSS и структурата на компонентите са запазени.

## А. Детекция и изрязване

`apps/web/scripts/detect-image-marks.mjs` анализира последните 8% по двете оси чрез high-pass brightness и шаблони на четирилъчев силует. Позицията е калибрирана спрямо **визуално потвърдените** знаци в тези оригинали: център около 95.3% × 93.8%, с толеранс. Това е детектор за конкретния generator overlay, не универсален детектор за знак навсякъде в кадъра. Bbox е оценка на целия силует в оригинални пиксели, включително върха над ROI; confidence е корелация, **не вероятност**. Праг 0.37. Положителен синтетичен пример, бял/тъмен отрицателен пример и реалните ъгли са проверени.

| Оригинал | ✦ | bbox x,y,w,h (px) | Confidence |
|---|---|---|---:|
| baklava-s-orehi.png | да | 2234,1626,108,108 | 0.928 |
| banitsa-s-praz.png | да | 2243,1635,90,90 | 0.576 |
| banitsa-sas-sirene.png | да | 2252,1644,72,72 | 0.594 |
| bob-chorba.png | да | 2252,1644,72,72 | 0.490 |
| hero-banitsa-shopska-salad.png | да | 2249,1641,78,78 | 0.589 |
| kavarma-sas-svinsko.png | да | 2234,1626,108,108 | 0.668 |
| krem-karamel.png | да | 2234,1626,108,108 | 0.920 |
| kyufteta-na-skara.png | да | 2252,1644,72,72 | 0.658 |
| mekitsi.png | да | 2234,1626,108,108 | 0.675 |
| mish-mash.png | да | 2249,1641,78,78 | 0.670 |
| musaka-s-kartofi.png | да | 2234,1626,108,108 | 0.927 |
| omlet-sas-sirene.png | да | 2234,1626,108,108 | 0.642 |
| ovcharska-salata.png | да | 2249,1641,78,78 | 0.569 |
| palneni-chushki-s-oriz.png | да | 2249,1641,78,78 | 0.654 |
| parzheni-filiyki.png | да | 2234,1626,108,108 | 0.914 |
| pile-teriyaki.png | не | — | 0.204 |
| pileshka-supa.png | да | 2234,1626,108,108 | 0.943 |
| sarmi-s-kiselo-zele.png | да | 2234,1626,108,108 | 0.807 |
| shkembe-chorba.png | да | 2234,1626,108,108 | 0.816 |
| shopska-salata.png | да | 2249,1641,78,78 | 0.588 |
| sirene-po-shopski.png | да | 2234,1626,108,108 | 0.804 |
| sladak-salam.png | да | 2234,1626,108,108 | 0.862 |
| snezhanka.png | да | 2252,1644,72,72 | 0.533 |
| tarator.png | да | 2234,1626,108,108 | 0.699 |
| tikvenik.png | да | 2252,1644,72,72 | 0.485 |
| tutmanik.png | да | 2252,1644,72,72 | 0.422 |
| zeleva-salata.png | да | 2234,1626,108,108 | 0.928 |

`optimize-images.mjs` → `cropFor`: отдясно/отдолу до bbox минус 1.5% от съответната ос; един общ scale factor пази пропорцията, изрязването е закотвено горе вляво. Връщане до съществуващите 2000×1493 с lanczos3, WebP quality 82. **19 мастера** са регенерирани от оригиналите; няма повторно компресиране на вече компресиран master. PNG хешовете са непроменени — включително локалния untracked PNG. Файл без знак със съществуващ master не се презаписва.

**Седем изключения, запазени byte-for-byte**, защото предложената граница пресича/докосва чинията или подноса: `banitsa-s-praz`, `hero-banitsa-shopska-salad`, `palneni-chushki-s-oriz`, `sarmi-s-kiselo-zele`, `shopska-salata`, `tikvenik`, `tutmanik`. При тях знакът остава. [Композиции с граници](shots/images/crop-review.jpg), [изключения и причини](../../apps/web/scripts/image-crop-exceptions.json).

Повторният **същия** детектор: `unexpectedMarks: []`; засечени са само седемте изключения. [Преди JSON](shots/images/recipes-marks.json), [след JSON](shots/images/recipes-web-marks.json), [решения за генериране](shots/images/generation.json), [ъгли преди](shots/images/corners-recipes.jpg), [ъгли след](shots/images/corners-recipes-web.jpg).

Шест JPEG сравнения, quality 80: [баклава](shots/images/baklava-s-orehi-before-after.jpg), [боб](shots/images/bob-chorba-before-after.jpg), [крем карамел](shots/images/krem-karamel-before-after.jpg), [мусака](shots/images/musaka-s-kartofi-before-after.jpg), [пилешка супа](shots/images/pileshka-supa-before-after.jpg), [таратор](shots/images/tarator-before-after.jpg). Контактният лист и примерът с пилешката супа са прегледани визуално.

## Б. Реален image transfer

Playwright Chromium, DPR **1**, viewport 1440×900 и 390×844, чист browser context за всеки адрес, browser cache изключен чрез CDP. Сбор на `Network.loadingFinished.encodedDataLength` за image responses, включително HTTP overhead и atmosphere.webp. Първи екран = networkidle + 1.5 s без scroll; включва и снимките, които native lazy-loading зарежда предварително. После превъртане на стъпки 0.7 viewport, изчакване и сбор на всички снимки. Преди/след са по същия метод. Сървърният optimizer cache може да е загрят — това не премахва байтове от отговорите към празния browser cache.

| Страница | Ширина | Първи екран ПРЕДИ → СЛЕД (bytes) | Цяло превъртане ПРЕДИ → СЛЕД (bytes) |
|---|---:|---:|---:|
| /catalog | 1440 | 602,608 → 517,948 | 689,202 → 589,975 |
| /catalog | 390 | 378,342 → 185,374 | 899,219 → 442,813 |
| / | 1440 | 466,448 → 438,073 | 634,145 → 585,246 |
| / | 390 | 256,947 → 193,319 | 415,863 → 291,142 |
| /catalog/shopska-salata | 1440 | 236,730 → 234,291 | 236,730 → 234,291 |
| /catalog/shopska-salata | 390 | 95,564 → 93,125 | 95,564 → 93,125 |

И двете цели са покрити още преди промяната. След нея каталогът е под 1 MB първи екран и под 2.5 MB целия scroll с голям запас. Mobile общото image тегло е намалено приблизително наполовина. [Преди](shots/images/transfer-before.json), [само след А](shots/images/transfer-phase-a.json), [окончателно след](shots/images/transfer-after.json). Всеки JSON съдържа URL/bytes за всяка снимка, ширини на карти, currentSrc и наблюдавания LCP.

Причина: 358px колона се рекламираше като 100vw, 592/284px desktop колони — като 660/330px, а първите **три** карти бяха priority. Поправка: точни `sizes` от max-width/gutters/24px gap и брейкпойнтите; само първата catalog снимка е eager/high/priority, останалите lazy. Заявката на първата карта става 640 вместо 750 на desktop и 384 вместо 640 на телефон. Седмичната снимка на Начало също използва реалните 7/12 колони. Там измереният LCP е текст, затова hero снимката остава eager, но без priority/preload. При detail измереният LCP е hero снимката — запазен priority и изричен fetchPriority=high. Не са нужни нови card мастери: Next вече доставя responsive варианти; не се свалят целите 2000px файлове за картите.

Променени web файлове: `src/lib/image-sizes.ts`, `src/app/recipe-tile.tsx`, `src/app/catalog/recipe-catalog.tsx`, `src/app/page.tsx`, `src/app/catalog/[slug]/page.tsx`. Измерване: `scripts/measure-image-transfer.mjs`. Няма промяна на Next/deployment config, quality или дизайна.

## В. Спряна по т. 6 — без DB записи

Read-only `listPublicCatalogRecipes({page:1,pageSize:50})` през наличния service/repository, възпроизводим с `node apps/web/scripts/inspect-manual-images.cjs`, върна:

```json
{"title":"Пиле Тариаки","slug":"пиле-тариаки","imageSrc":"/images/recipes/musaka-s-kartofi.png"}
```

Repository `slugify` запазва кирилица; при create проверява уникалност и добавя суфикс при нужда. `updateRecipeRecordBySlug` използва `nextSlug = slug`, затова редакцията на заглавието **не променя адреса**. `imageSrc` горе е repository заместител за празно imageUrl, не собствена снимка.

Реалният slug **не минава** `^[a-z0-9-]+$`. Мастер `пиле-тариаки.webp` би нарушил изричното правило; `pile-teriyaki.webp` не съответства на текущия запис. Затова **не са внедрени конвенцията, генерирането на този master и тестът с/без него**. Съществуващата рецепта продължава да показва плочката. Не е преименуван/добавен в git `pile-teriyaki.png`.

В сегашния админ няма поле за slug, така че **няма стойност в редакцията на същия запис**, която да го направи ASCII. Ако собственикът избере нов запис, точният път през текущия UI е: създаване със заглавие **`pile-teriyaki`**, попълване на останалите полета, записване; проверка на получения уникален slug; след това редакция на заглавието на **„Пиле терияки“**. При свободен адрес slug-ът остава `pile-teriyaki`, а бъдещото съответствие ще е `pile-teriyaki.png → pile-teriyaki.webp`. Не е създаван или изтриван запис от агента. Запазването на същия текущ запис с ASCII slug изисква отделно разрешена възможност за промяна на slug.

## Проверки и ограничения

```text
npm.cmd run lint --workspace apps/web
Exit 0: eslint . --max-warnings=0
npx.cmd --no-install tsc --noEmit -p apps/web
Exit 0, без грешки
npm.cmd run build:check --workspace apps/web
Compiled successfully in 3.4s; static pages 23/23; Exit 0, без предупреждения
node apps/web/scripts/detect-image-marks.mjs --verify
unexpectedMarks: []; седемте compositionExceptions остават
```

Част А: **81 passed (2.4m)**, axe 0 на шестте страници. Окончателно за Б: **84 passed (2.4m)**, Exit 0; axe **0 нарушения на седемте страници** (шестте поискани адреса плюс реалната ръчна рецепта `/catalog/пиле-тариаки`). Включени са 14 нови теста. Новите проверки за currentSrc потвърждават 384/640px и единствена eager/high-priority catalog снимка. Lint и tsc са повторени успешно преди commit.

Изпълняваната команда е `npm.cmd run test:e2e --workspace apps/web -- --grep-invert "real Neon registration|real Neon admin|favourite: a guest|admin recipe on the substitute image"`. Точно **четири стари теста не са стартирани**, защото регистрират потребители, променят favorites или създават/трият рецепти в Neon. Забраната за DB записи е спазена; това **не е твърдение за успешен пълен suite**. Новите проверки са read-only: SHA-256, неизменени exception masters/размери, detector positives/negatives, JPEG формат, sizes/loading/priority и axe, включително реалната ръчна рецепта.

Първият run блокира при networkidle за една cold image заявка и беше прекъснат. След рестарт и завършване на optimizer отговорите чрез `warm-image-cache.mjs` повторението за А мина. Helper-ът загрява 234 локални варианта; не променя application data. Измерването на browser transfer остава с изключен browser cache. Playwright отпечатва средово NO_COLOR/FORCE_COLOR предупреждение; build-ът е без предупреждения.

**Непроверено:** друг browser/DPR, реална мобилна мрежа, production/CDN кеш, произволни бъдещи композиции/позиции на watermark, четирите DB-write сценария и неосъществената конвенция от В. Детекторът е калибриран за този набор, не гарантира разпознаване на бъдещи различни overlay-и. Дълбок cross-browser/responsive/Lighthouse/SEO одит не е правен.

**Изисква решение:** ASCII slug за Част В; избор за седемте композиции със запазен знак, ако собственикът иска допълнителна обработка без изрязване на съдовете.

Commit А: `99cf885`. Commit Б включва този отчет; точният му hash е във финалния отговор. Началният server PID 10736 е спрян преди build; последният verification server PID 2876 е спрян след проверките. Накрая няма listener на 3000/3001/3002. В работното дърво остава само предоставеният untracked `pile-teriyaki.png`.
