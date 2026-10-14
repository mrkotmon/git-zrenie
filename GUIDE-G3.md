# Гайд по сдаче G3 · Автоматизация, CI

Всё в комплекте проверено: линтер, форматирование, unit-тесты с покрытием 100 %, e2e в Chromium.
Каждая демо-ветка ломает ровно ту проверку, которую демонстрирует.

Сроки: до 15.10 включительно — коэффициент 0.8, с 16.10 — 0.6.

## Что в комплекте

```
.github/
  workflows/ci.yml            # три проверки: lint, unit, e2e
  pull_request_template.md    # шаблон PR (G3.0)
client/                       # Vite + React 19, JavaScript
  src/lib/layout.js           # логика раскладки графа (то, что покрываем тестами)
  src/lib/layout.test.js      # unit-тесты (Vitest)
  src/App.jsx, App.test.jsx   # страница-заглушка и её тест
  e2e/home.spec.js            # e2e-тест (Playwright)
  vite.config.js              # Vitest + порог покрытия 80 %
  playwright.config.js
  eslint.config.js, .prettierrc.json
  package.json, package-lock.json
scripts/
  create-g3-demo-branches.sh  # создаёт 7 веток для демо-PR
  demo/stats.js               # код без тестов для G3.5
```

## Шаг 1. Залить основу (один PR)

```bash
cd git-zrenie
git checkout main && git pull
git checkout -b ci/P3.8-ci-setup
# распаковать комплект в корень репозитория (папки .github, client, scripts)
cd client
npm ci                     # установить зависимости строго по package-lock.json
npm run lint               # ESLint — должно пройти без ошибок
npm run format:check       # Prettier
npm run test:coverage      # unit-тесты + таблица покрытия
npx playwright install chromium
npm run test:e2e           # e2e: соберёт сайт, поднимет его и откроет в браузере
cd ..
git add .github client scripts
git commit -m "P3.8: CI — линтер, unit-тесты с покрытием, e2e"
git push -u origin ci/P3.8-ci-setup
```

Открыть PR в `main`. На вкладке **Checks** появятся три проверки: `lint`, `unit`, `e2e`.
Когда все зелёные — Approve от другого участника → **Squash and merge**.

> Windows: команды те же, в PowerShell или Git Bash. Скрипт из шага 4 запускать в **Git Bash**.

## Шаг 2. Запретить слияние, если CI красный (G3.4–G3.6, G3.8)

Без этого шага CI только показывает крестик, а слить PR всё равно можно — пункты не засчитают.

1. **Settings → Branches** → у правила `main` нажать **Edit**.
2. Включить **Require status checks to pass before merging**.
3. В поиске ниже ввести и добавить по очереди: `lint`, `unit`, `e2e`.
   Они появляются в списке только после того, как CI хоть раз отработал (шаг 1).
4. Включить **Require branches to be up to date before merging** — по желанию.
5. **Save changes**.

Проверка: в любом PR с красной проверкой кнопка слияния серая, написано *Merging is blocked — Required status check "unit" has failed*.

## Шаг 3. Добавить преподавателя

Запросить ревью можно только у участника репозитория:
**Settings → Collaborators → Add people** → ник преподавателя на GitHub (уточните в чате курса).

## Шаг 4. Создать демо-ветки

После слияния шага 1:

```bash
git checkout main && git pull
bash scripts/create-g3-demo-branches.sh
```

Скрипт создаст и запушит 7 веток и напечатает ссылки для открытия PR.

## Шаг 5. Открыть PR

В каждом: заголовок с номером пункта, ревьюер — преподаватель, описание — по образцу ниже.

| Заголовок PR | Ветка | Что должно произойти | Сливать? |
|---|---|---|---|
| `G3.0: правила контрибьюта` | `docs/G3.0-contributing-fix` | заполненный шаблон, «Review required», прямой push в main запрещён | да, после ревью |
| `G3.1, G3.3: unit-тесты и покрытие` | `test/G3.1-unit-tests` | `unit` зелёный, в логе таблица покрытия, отчёт в Artifacts | да |
| `G3.2: e2e-тесты` | `test/G3.2-e2e-tests` | `e2e` зелёный | да |
| `G3.4: CI блокирует PR с падающими unit-тестами` | `demo/G3.4-broken-unit-test` | `unit` красный, слияние заблокировано | **нет** |
| `G3.5: CI блокирует PR с покрытием ниже 80 %` | `demo/G3.5-low-coverage` | `unit` красный: *Coverage for lines (53.84%) does not meet global threshold (80%)* | **нет** |
| `G3.6: CI блокирует PR с падающими e2e` | `demo/G3.6-broken-e2e` | `e2e` красный, `unit` зелёный | **нет** |
| `G3.7, G3.8: ESLint/Prettier и блокировка` | `demo/G3.8-lint-errors` | `lint` красный: `no-unused-vars` и Prettier | **нет** |

G3.7 (сам факт, что ESLint и Prettier есть) показывается конфигами из шага 1 и тем же PR G3.8.

### Образцы описаний

**G3.0**
```
Демонстрация G3.0.
- main защищён: прямой push запрещён, нужен PR и 1 одобрение, обсуждения должны быть закрыты.
- Шаблон PR: .github/pull_request_template.md (он открылся при создании этого PR).
- Работаем по GitHub Flow, правила — docs/git-workflow.md и docs/Contributing.md.
Сам PR исправляет пример имени ветки в Contributing.md.
```

**G3.1, G3.3**
```
Демонстрация G3.1 и G3.3.
Unit-тесты (Vitest) запускаются в CI в задаче `unit` командой `npm run test:coverage`.
Покрытие считается v8, таблица — в логе задачи, HTML-отчёт — в Artifacts → coverage.
Порог 80 % задан в client/vite.config.js (coverage.thresholds).
```

**G3.2**
```
Демонстрация G3.2.
E2E (Playwright, Chromium) запускаются в CI в задаче `e2e`: сайт собирается, поднимается
`vite preview`, тест открывает его в браузере. Конфиг — client/playwright.config.js.
```

**G3.4**
```
Демонстрация G3.4 — PR НЕ сливать.
Функция commitHeight специально сломана: возвращает число строк вместо логарифма.
3 unit-теста падают → задача `unit` красная → слияние заблокировано правилом защиты main.
```

**G3.5**
```
Демонстрация G3.5 — PR НЕ сливать.
Добавлен модуль src/lib/stats.js без тестов. Все тесты проходят, но покрытие строк падает
до ~54 % при пороге 80 % → задача `unit` красная → слияние заблокировано.
```

**G3.6**
```
Демонстрация G3.6 — PR НЕ сливать.
Текст кнопки «Войти через GitHub» изменён на «Войти». Unit-тесты зелёные, но e2e-тест
ищет кнопку по тексту и падает → задача `e2e` красная → слияние заблокировано.
```

**G3.7, G3.8**
```
Демонстрация G3.7 и G3.8 — PR НЕ сливать.
В коде используются ESLint 9 (client/eslint.config.js) и Prettier (client/.prettierrc.json).
Здесь добавлены неиспользуемая переменная и неотформатированный код → `npm run lint`
и `npm run format:check` падают → задача `lint` красная → слияние заблокировано.
```

## Шаг 6. Сдать

1. Дождаться, пока во всех PR отработает CI (2–4 минуты).
2. Проверить: в демо-PR кнопка слияния заблокирована, в зелёных — доступна.
3. Написать в чат команды, отметив преподавателя:

```
@преподаватель G3 готов к ревью — проект №14 «Git Зрение»:
G3.0 — <ссылка>
G3.1, G3.3 — <ссылка>
G3.2 — <ссылка>
G3.4 — <ссылка>
G3.5 — <ссылка>
G3.6 — <ссылка>
G3.7, G3.8 — <ссылка>
```

## Если что-то пошло не так

| Симптом | Причина и решение |
|---|---|
| `npm ci` падает: *package-lock.json not found* | Не скопирован `client/package-lock.json` — он обязателен для CI |
| В шаге 2 нет `lint` / `unit` / `e2e` в поиске | CI ещё ни разу не запускался — откройте PR из шага 1 и дождитесь |
| Демо-PR красный, но кнопка слияния активна | Не выполнен шаг 2 или не добавлена нужная проверка |
| `e2e` падает в CI с *browserType.launch* | Пропущен шаг `npx playwright install --with-deps chromium` в ci.yml |
| Локально `npm run test:e2e` не находит браузер | Выполнить `npx playwright install chromium` |
| Нельзя назначить преподавателя ревьюером | Он не добавлен в Collaborators (шаг 3) |
| Скрипт: *Есть незакоммиченные изменения* | `git status`, закоммитить или `git stash` |
