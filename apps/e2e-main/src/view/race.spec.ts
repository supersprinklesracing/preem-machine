import { expect, test } from '../util/fixtures';

test.describe('view: race', () => {
  test('basic', async ({ page }) => {
    await page.goto('/view/race?path=races/masters-women');
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
