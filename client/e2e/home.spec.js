import { test, expect } from '@playwright/test';

test('главная страница открывается и показывает название', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Git Зрение');
  await expect(page.getByRole('heading', { name: 'Git Зрение' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти через GitHub' })).toBeVisible();
});
