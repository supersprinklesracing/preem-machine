import { expect, test } from '../util/fixtures';

test.describe('view: organization', () => {
  test('basic', async ({ page }) => {
    await page.goto('/view/super-sprinkles');
    await expect(
      page.getByRole('heading', { name: 'Super Sprinkles Racing' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
