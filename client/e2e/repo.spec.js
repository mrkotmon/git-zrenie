import { test, expect } from '@playwright/test';

// Ответ GitHub API подменяем, чтобы тест не зависел от сети и лимитов.
const commits = [
  {
    sha: 'a1b2c3d4e5f6',
    parents: [{ sha: 'b2c3d4e5f6a1' }],
    author: { login: 'ada' },
    commit: { message: 'Добавить граф', author: { name: 'Ada', date: '2026-11-03T10:00:00Z' } },
    html_url: 'https://github.com/acme/app/commit/a1b2c3d4e5f6',
  },
  {
    sha: 'b2c3d4e5f6a1',
    parents: [],
    author: { login: 'bob' },
    commit: { message: 'Начало проекта', author: { name: 'Bob', date: '2026-11-01T10:00:00Z' } },
    html_url: 'https://github.com/acme/app/commit/b2c3d4e5f6a1',
  },
];

test('ссылка с лендинга открывает графики и детали коммита', async ({ page }) => {
  await page.route('https://api.github.com/repos/acme/app/commits**', (route) =>
    route.fulfill({ json: commits }),
  );

  await page.goto('/');
  await page.getByLabel('Ссылка на репозиторий GitHub').fill('github.com/acme/app');
  await page.getByRole('button', { name: 'Разобрать' }).click();

  await expect(page).toHaveURL(/\/repo\/acme\/app$/);
  await expect(page.getByRole('img', { name: 'Коммиты по дням' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Коммиты по авторам' })).toBeVisible();

  await page.getByRole('button', { name: /Начало проекта/ }).click();
  const details = page.getByRole('complementary', { name: 'Детали коммита' });
  await expect(details).toContainText('bob');
  await expect(details).toContainText('b2c3d4e');
});

test('несуществующий репозиторий показывает ошибку', async ({ page }) => {
  await page.route('https://api.github.com/repos/acme/missing/commits**', (route) =>
    route.fulfill({ status: 404, json: { message: 'Not Found' } }),
  );

  await page.goto('/repo/acme/missing');
  await expect(page.getByRole('alert')).toContainText('Репозиторий не найден');
});
