import { expect, test } from '@playwright/test';

test.describe('view: user', () => {
  test('basic', async ({ page }) => {
    await page.goto('/user/user-alex-doe');
    await expect(
      page.getByRole('heading', { name: 'Alex Doe' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
