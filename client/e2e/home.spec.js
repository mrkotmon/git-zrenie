import { test, expect } from '@playwright/test';

test('лендинг открывается и показывает hero', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Git Зрение');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Каждый коммит как часть истории' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти через GitHub' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Разобрать' })).toBeVisible();
});

test('лендинг проверяет ссылку на репозиторий', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Ссылка на репозиторий GitHub').fill('gitlab.com/acme/repo');
  await page.getByRole('button', { name: 'Разобрать' }).click();
  await expect(page.getByRole('alert')).toHaveText('Введите ссылку на репозиторий GitHub');
});
