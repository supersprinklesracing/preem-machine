import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/account');

  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
});
