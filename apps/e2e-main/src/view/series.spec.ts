import { expect, test } from '../util/fixtures';

test.describe('view: series', () => {
  test('basic', async ({ page }) => {
    await page.goto('/view/super-sprinkles/sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
