import { test, expect } from '@playwright/test';

// Сервера в e2e нет — подменяем его ответы, как это делал бы настоящий /api.
const user = {
  id: 1,
  github_id: 42,
  login: 'ada',
  avatar_url: null,
  created_at: '2026-09-15T10:00:00Z',
};

test('после входа шапка меняется, «Мои разборы» открываются, выход возвращает «Войти»', async ({
  page,
}) => {
  let signedIn = true;
  await page.route('**/api/auth/me', (route) =>
    signedIn
      ? route.fulfill({ json: user })
      : route.fulfill({ status: 401, json: { error: 'unauthorized' } }),
  );
  await page.route('**/api/auth/logout', (route) => {
    signedIn = false;
    return route.fulfill({ status: 204 });
  });

  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Меню пользователя @ada' });
  await expect(menuButton).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти через GitHub' })).toHaveCount(0);

  await menuButton.click();
  await page.getByRole('menuitem', { name: 'Мои разборы' }).click();
  await expect(page).toHaveURL(/\/runs$/);
  await expect(page.getByRole('heading', { name: 'Мои разборы' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Профиль' })).toContainText('@ada');

  await page.getByRole('button', { name: 'Меню пользователя @ada' }).click();
  await page.getByRole('menuitem', { name: 'Выйти' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toBeVisible();
});

test('без входа «Мои разборы» ведут на страницу входа', async ({ page }) => {
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 401, json: { error: 'unauthorized' } }),
  );

  await page.goto('/runs');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Вход в Git Зрение' })).toBeVisible();
});
