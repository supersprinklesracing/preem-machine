import { expect, test } from '../fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from '../util/e2e-test-utils';

test.describe('manage: series', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();

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
