import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';
import { expect, test } from '../util/fixtures';

test.describe('manage: series', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto('/manage/super-sprinkles/sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('new', async ({ page }) => {
    await page.goto('/manage/super-sprinkles/series/new');
    await expect(
      page.getByRole('heading', { name: 'Create Series' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('edit', async ({ page }) => {
    await page.goto('/manage/super-sprinkles/sprinkles-2025/edit');
    await expect(
      page.getByRole('heading', { name: 'Edit Series' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
