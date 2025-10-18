import { expect, test } from '../util/fixtures';

test.describe('view: preem', () => {
  test('basic', async ({ page }) => {
    await page.goto(
      '/view/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap',
    );
    await expect(
      page.getByRole('heading', { name: 'First Lap Leader' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
