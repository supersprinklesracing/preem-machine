import { expect, test } from '@playwright/test';

test.describe('view: event', () => {
  test('basic', async ({ page }) => {
    await page.goto(
      '/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025',
    );
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
