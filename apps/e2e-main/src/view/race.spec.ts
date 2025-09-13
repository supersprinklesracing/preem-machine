import { expect, test } from '@playwright/test';

test.describe('view: race', () => {
  test('basic', async ({ page }) => {
    await page.goto(
      '/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women',
    );
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
