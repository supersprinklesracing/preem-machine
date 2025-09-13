import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';

test.describe('manage: series', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto('/manage/org-super-sprinkles/series-sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('new', async ({ page }) => {
    await page.goto('/manage/org-super-sprinkles/series/new');
    await expect(
      page.getByRole('heading', { name: 'Create Series' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('edit', async ({ page }) => {
    await page.goto('/manage/org-super-sprinkles/series-sprinkles-2025/edit');
    await expect(
      page.getByRole('heading', { name: 'Edit Series' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
