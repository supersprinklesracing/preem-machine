import { expect, test } from '../util/fixtures';

test.describe('view: event', () => {
  test('basic', async ({ page }) => {
    await page.goto('/view/super-sprinkles/sprinkles-2025/giro-sf-2025');
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
