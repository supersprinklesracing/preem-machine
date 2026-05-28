import { expect, test } from '../util/fixtures';

test.describe('view: preem', () => {
  test('basic', async ({ page }) => {
    await page.goto('/view/preem?path=preems/first-lap');
    await expect(
      page.getByRole('heading', { name: 'First Lap Leader' }),
    ).toBeVisible();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
