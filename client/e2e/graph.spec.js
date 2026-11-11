import { test, expect } from '@playwright/test';

test('страница графа показывает окружение и заглушку сцены', async ({ page }) => {
  await page.goto('/graph');

  await expect(page).toHaveTitle('Git Зрение');
  await expect(page.getByRole('heading', { name: 'Ветки' })).toBeVisible();
  await expect(page.getByText('Здесь будет граф веток и коммитов')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Выбранный коммит' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Спринт 8/ })).toBeVisible();
});

test('на странице графа переключается тема', async ({ page }) => {
  await page.goto('/graph');
  await page.getByRole('button', { name: 'Бумага' }).click();

  await expect(page.locator('.graph-page')).toHaveAttribute('data-theme', 'paper');
  await expect(page.getByRole('button', { name: 'Бумага' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('демо с лендинга открывает страницу графа', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Посмотреть демо' }).click();

  await expect(page).toHaveURL(/\/graph$/);
  await expect(page.getByText('Здесь будет граф веток и коммитов')).toBeVisible();
});
