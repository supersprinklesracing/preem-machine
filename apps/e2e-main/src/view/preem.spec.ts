import { expect, test } from '@playwright/test';

test.describe('view: preem', () => {
  test('basic', async ({ page }) => {
    await page.goto(
      '/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-giro-sf-2025-masters-women-first-lap',
    );
    await expect(
      page.getByRole('heading', { name: 'First Lap Leader' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
