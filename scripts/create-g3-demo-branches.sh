#!/usr/bin/env bash
# Создаёт ветки для демо-PR по пунктам G3. Запуск из корня клона git-zrenie,
# ПОСЛЕ того как PR с CI (ветка ci/P3.8-ci-setup) слит в main:
#   bash scripts/create-g3-demo-branches.sh
set -euo pipefail
REPO_URL="https://github.com/mrkotmon/git-zrenie"
HERE="$(cd "$(dirname "$0")" && pwd)"

git diff --quiet && git diff --cached --quiet || { echo "Есть незакоммиченные изменения"; exit 1; }
git checkout -q main && git pull -q --ff-only

make_branch() { # ветка | сообщение коммита | команда, вносящая изменение
  local branch="$1" msg="$2" change="$3"
  if git show-ref --verify --quiet "refs/heads/$branch"; then echo "• $branch уже есть"; return; fi
  git checkout -q -b "$branch" main
  eval "$change"
  git add -A && git commit -q -m "$msg"
  git push -q -u origin "$branch"
  echo "✓ $branch → $REPO_URL/compare/main...$branch?expand=1"
  git checkout -q main
}

# G3.0 — правила контрибьюта: настоящая мелкая правка, видно шаблон PR и обязательное ревью
make_branch "docs/G3.0-contributing-fix" "G3.0: пример имени ветки в Contributing" \
  "sed -i.bak 's/git checkout -b branchname/git checkout -b docs\/P2.1-architecture/' docs/Contributing.md && rm -f docs/Contributing.md.bak"

# G3.1 + G3.3 — новый unit-тест, CI зелёный, в логах таблица покрытия
make_branch "test/G3.1-unit-tests" "G3.1, G3.3: unit-тест проекции с поворотом" \
  "cat >> client/src/lib/layout.test.js <<'T'

describe('project: поворот', () => {
  it('поворот на 90° переводит ось Z в ось X экрана', () => {
    const p = project({ x: 0, y: 0, z: 2 }, Math.PI / 2, 0);
    expect(p.sx).toBe(-2);
  });
});
T"

# G3.2 — новый e2e-тест, CI зелёный
make_branch "test/G3.2-e2e-tests" "G3.2: e2e-тест счётчика коммитов" \
  "cat >> client/e2e/home.spec.js <<'T'

test('на главной показано число коммитов демо', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('commit-count')).toHaveText('Коммитов в демо: 3');
});
T"

# G3.4 — ломаем функцию, unit-тесты падают
make_branch "demo/G3.4-broken-unit-test" "G3.4: демонстрация — сломана commitHeight, unit-тесты падают" \
  "sed -i.bak 's/return lines === 0 ? 0 : Math.round(Math.log10(lines + 1) \* 100) \/ 100;/return lines;/' client/src/lib/layout.js && rm -f client/src/lib/layout.js.bak"

# G3.5 — код без тестов, покрытие падает ниже 80 %
make_branch "demo/G3.5-low-coverage" "G3.5: демонстрация — модуль stats.js без тестов, покрытие ниже 80 %" \
  "cp '$HERE/demo/stats.js' client/src/lib/stats.js"

# G3.6 — меняем текст кнопки, e2e падает (unit-тесты при этом зелёные)
make_branch "demo/G3.6-broken-e2e" "G3.6: демонстрация — изменена кнопка входа, e2e падает" \
  "sed -i.bak 's#>Войти через GitHub<#>Войти<#' client/src/App.jsx && rm -f client/src/App.jsx.bak"

# G3.8 — неиспользуемая переменная и плохое форматирование
make_branch "demo/G3.8-lint-errors" "G3.8: демонстрация — ошибки ESLint и Prettier" \
  "printf '\nconst unused = 42\nexport const   badlyFormatted = ( a,b )=>{return a+b}\n' >> client/src/lib/layout.js"

echo
echo "Готово. Откройте PR по ссылкам выше, ревьюер — преподаватель. Ветки demo/* НЕ сливать."
