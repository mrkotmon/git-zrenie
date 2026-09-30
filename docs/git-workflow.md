# Работа с репозиторием

Ответственный: Павлов Руслан · задача P3.5

## Модель ветвления: GitHub Flow

Методичка рекомендует [GitHub Flow](https://docs.github.com/ru/get-started/using-github/github-flow), и для команды из трёх человек он проще Git Flow: одна долгоживущая ветка, всё остальное — короткие ветки на одну задачу.


| Ветка | Живёт | Назначение | Защита |
| --- | --- | --- | --- |
| `main` | всегда | рабочее состояние проекта, из неё сдаём и (с G4) деплоим | да |
| `<тип>/<ID>-<кратко>` | 1–5 дней | одна задача с доски | нет |

Отдельная `develop` не нужна: у нас нет параллельно поддерживаемых версий, а автодеплой на G4 делается прямо из `main`.

### Типы веток

| Префикс | Когда | Пример |
| --- | --- | --- |
| `docs/` | документация, схемы, макеты | `docs/P2.1-architecture` |
| `feat/` | новая функциональность | `feat/P2.9-canvas-render` |
| `fix/` | исправление | `fix/P2.11-hit-detection-zoom` |
| `chore/` | настройка, зависимости, конфиги | `chore/P3.5-repo-setup` |
| `ci/` | GitHub Actions | `ci/P3.8-unit-coverage` |
| `test/` | только тесты | `test/P2.7-layout-tests` |
| `demo/` | демонстрационные PR для G3, **не мёржатся** | `demo/G3.4-broken-unit-test` |


Правила имён:

- только латиница, цифры, `-`, `.` и один `/` после префикса;
- **нельзя начинать с `main/`**: у git уже есть ветка `main`, и ветку внутри неё создать невозможно — GitHub ответит «File could not be edited»;



## Настройки GitHub

**Settings → Branches → Add rule → `main`:**

- [x] Require a pull request before merging, 1 approval
- [x] Dismiss stale approvals when new commits are pushed
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings
- [ ] Require status checks — включаем на G3, когда появится CI

**Settings → General → Pull Requests:** оставить только Squash merging, включить Automatically delete head branches.

**Метки:** `g2` `g3` `g4` `g5` `week-1` `week-2` `docs` `design` `frontend` `backend` `architecture` `devops` `qa` `analytics`.

**Projects:** доска со столбцами Backlog / Ready / In progress / In review / Done.
