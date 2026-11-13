# npm audit triage — „Софра“

Дата: 13.11.2026 г. · branch `feat/redesign-sofra` · контролиран security patch само на Next.js линията, без `npm audit fix`, major upgrade или `postcss` override.

## Изпълнени проверки

```powershell
npm.cmd audit --json
npm.cmd audit --omit=dev --workspace apps/web --json
```

| Обхват | Critical | High | Moderate | Low | Общо |
|---|---:|---:|---:|---:|---:|
| Целият workspace | 2 | 19 | 24 | 1 | 46 |
| `apps/web`, `--omit=dev` | 0 | 5 | 1 | 0 | 6 |

Вторият audit работи върху общия workspace lockfile. Затова включва `brace-expansion` и `browserslist`, въпреки че `npm ls --workspace apps/web --omit=dev --all` не ги намира в production дървото на web. Реалната отчетена web верига е `next → postcss → nanoid/source-map-js`; `sharp@0.35.5` вече не е audit находка. Оставащият moderate запис за `next` е ефект от pin-натия в Next `postcss`, а не от първоначалната critical уязвимост.

## Critical и high находки

„Без major“ означава без major upgrade на пряката зависимост/SDK на съответното приложение. Next.js и `sharp` са затворени с контролирания patch по-долу; останалите версии са препоръки за отделни, изрично разрешени задачи.

| Пакет и инсталирана версия | Тежест | Тип и верига | Къде попада | Поправка без major | Достижимост в този проект |
|---|---|---|---|---|---|
| `next@15.5.18 → 15.5.28` | critical → **затворена** | Пряка: `apps/web` | Web production runtime | Изпълнено: `15.5.28` | **Поправено и проверено.** `npm ls` потвърждава `next@15.5.28`; `build:check`, lint, TypeScript и non-writing Playwright suite минават. |
| `shell-quote@1.8.3` | critical | Транзитивна: `mobile → react-native → react-devtools-core` | Само mobile/devtools; не е в web production | Да: `1.9.0`, допустима от текущото `^1.6.1` | Практически недостижима: приложението не подава недоверени `.op` стойности към `quote()` и не извиква parser-а; пакетът не се deploy-ва с web runtime. |
| `tar@7.5.15` | critical | Транзитивна: `mobile → expo → @expo/cli` | Само mobile build/CLI | Да: `7.5.21`, допустима от текущото `^7.5.2` | Практически недостижима от приложението: няма runtime приемане/разархивиране на недоверени tar архиви; рискът е в локален/CI инструмент. |
| `@react-navigation/bottom-tabs@6.6.1` | high | Пряка за mobile | Само apps/mobile runtime | Не: audit предлага `7.21.0` | Потенциално достижима само през mobile navigation/deep links; няма отношение към web публикуването. |
| `@react-navigation/core@6.4.17` | high | Транзитивна: `mobile → @react-navigation/native` | Само apps/mobile runtime | Не: чрез `@react-navigation/native@7.5.1` | Потенциално достижима при злонамерен дълъг deep-link/query вход; mobile е извън текущия обхват. |
| `@react-navigation/elements@1.3.31` | high | Транзитивна: `bottom-tabs`/`native-stack` | Само apps/mobile runtime | Не: чрез navigation 7.x | Следва същата mobile navigation верига; не е в web runtime. |
| `@react-navigation/native@6.1.18` | high | Пряка за mobile | Само apps/mobile runtime | Не: audit предлага `7.5.1` | Потенциално достижима чрез mobile URL parsing; не е в web runtime. |
| `@react-navigation/native-stack@6.11.0` | high | Пряка за mobile | Само apps/mobile runtime | Не: audit предлага `7.21.0` | Следва същата navigation верига; не е в web runtime. |
| `@xmldom/xmldom@0.8.13`, `0.9.10` | high | Транзитивна: `expo → @expo/cli/@expo/config-plugins` | Mobile build/config tooling | Да: `0.8.15` и `0.9.12` | Няма app runtime XML parser и няма недоверен XML вход; достижима е само при tooling върху злонамерени project/config файлове. |
| `brace-expansion@1.1.14`, `2.1.1`, `5.0.6` | high | Транзитивна: web ESLint; mobile Expo/React Native | Web dev и mobile tooling; не е web production | Да: `1.1.21`, `2.1.7`, `5.0.12` | Няма потребителски glob шаблони в production; DoS входът е само локална/CI конфигурация. |
| `browserslist@4.28.2` | high | Транзитивна: web `autoprefixer`; mobile Expo | Build tooling; не е web runtime | Да: `4.28.7` | Build-time заявки със статична конфигурация; няма недоверени custom stats в production. |
| `compression@1.8.1` | high | Транзитивна: `mobile → expo → @expo/cli` | Mobile CLI | Да: `1.8.2` | Не се използва от Netlify/Next runtime на проекта; CLI не обслужва публични response-и. |
| `decode-uri-component@0.2.2` | high | Транзитивна: `mobile → navigation → query-string` | Само apps/mobile runtime | Не в текущата parent range; audit насочва към navigation 7.x | Потенциално достижима от злонамерен mobile deep link с много percent-encoded вход; не е в web runtime. |
| `image-size@1.2.1` | high | Транзитивна: `mobile → expo → metro` | Mobile bundler/tooling | Не като drop-in: поправката е `2.1.0`, а Metro изисква `^1.0.2` | Няма runtime обработка на качени JXL/HEIF/ICNS; рискът е при bundling на злонамерен локален asset. |
| `js-yaml@3.14.2`, `4.1.1` | high | Транзитивна: React Native test tooling и Expo CLI | Mobile dev/build tooling | Да: `3.15.2` и `4.3.2` | Няма публичен YAML вход; достижима само при обработка на злонамерена локална конфигурация. |
| `nanoid@3.3.12` | high | Транзитивна: `web → next → postcss` | Web build dependency | Да: `3.3.18`, допустима от `^3.3.6` | Уязвимите custom/non-secure генератори с отрицателен/нулев размер не се викат от app кода; не е request-time път. |
| `node-forge@1.4.0` | high | Транзитивна: `mobile → expo → @expo/cli` | Mobile CLI | Да: `1.4.3`, допустима от текущата range | Няма app runtime употреба на Forge/TLS/PKI parser-и; не е в web production. |
| `postcss@8.4.31`, `8.4.49`, `8.5.1` | high | Пряка web dev + транзитивна през Next/Expo | Web/mobile build tooling | Частично: `8.5.23` е в същия major; Next 15.5.x pin-ва `8.4.31`, затова е нужен проверен override или upstream Next промяна | Няма компилиране на потребителски CSS; source-map file-read сценариите са build-time и не са request-time достижими. |
| `query-string@7.1.3` | high | Транзитивна: `mobile → @react-navigation/core` | Само apps/mobile runtime | Не: audit насочва към navigation 7.x | Потенциално достижима през mobile deep links заради `decode-uri-component`; не е в web runtime. |
| `sharp@0.34.5 → 0.35.5` | high → **затворена** | Транзитивна: `web → next` | Web production image optimizer | Изпълнено чрез `next@15.5.28` | **Поправено и проверено.** `npm ls` потвърждава `sharp@0.35.5`; три локални снимки връщат HTTP 200 и в AVIF, и в WebP през `/_next/image`. |
| `source-map-js@1.2.1` | high | Транзитивна: `web → next → postcss` | Web build dependency | Да: `1.2.2`, допустима от `^1.0.2` | Не се обработват потребителски indexed source maps в runtime; build-time риск. |
| `undici@6.26.0` | high | Транзитивна: `mobile → expo → @expo/cli` | Mobile CLI | Да: `6.29.1`, допустима от `^6.18.2` | Не е HTTP клиентът на web runtime в тази верига; няма app път към засегнатите WebSocket/TLS/encoding сценарии. |
| `ws@6.2.3` | high | Транзитивна: `mobile → react-native` | Само mobile | Да: `6.2.4`, допустима от `^6.2.3` | Няма публичен WebSocket server в проекта; не е в web runtime. |

## Moderate и low

- 24 moderate package находки в целия workspace. Най-често са групирани около Expo config/CLI (`@expo/*`, `glob`, `minimatch`, `uuid`, `xcode`), TypeScript ESLint (`@typescript-eslint/*`) и DB tooling (`drizzle-kit`, `esbuild`, `@esbuild-kit/*`). Web production audit отчита 1 moderate по веригата `next → postcss`.
- 1 low находка: `deepmerge`, по Expo config веригата.

## Решение за трите critical пакета

| Critical пакет | Оценка за публикуване | Основание |
|---|---|---|
| `next@15.5.18` | **Затворено с `next@15.5.28`** | Пряката web production зависимост и `sharp` са patch-нати; critical броят за `apps/web --omit=dev` е 0. |
| `shell-quote@1.8.3` | **Не блокира публикуването на web** | Само mobile/devtools верига, без достижим недоверен вход; има съвместим patch (`1.9.0`). |
| `tar@7.5.15` | **Не блокира публикуването на web** | Само Expo CLI/build верига, без app runtime обработка на tar; има съвместим patch (`7.5.21`). |

## Кратки препоръки

1. **Изпълнено:** Next е `15.5.28`, `sharp` е `0.35.5`, critical за web production е 0, а build и non-writing Playwright suite са повторени успешно.
2. В отделна изрично разрешена dependency задача прегледайте lockfile-съвместимите patch версии (`nanoid`, `source-map-js`) и изчакайте подходящ upstream Next patch за pin-натия `postcss`; в тази задача няма override.
3. Направете отделна mobile задача за React Navigation 7.x и Expo/Metro веригата; не смесвайте тази major миграция с web publish поправката.
4. Не използвайте автоматичен `npm audit fix --force`; прегледайте diff-а и повторете двата audit run-а след всяка група промени.
