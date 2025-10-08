import { expect, test } from '../fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from '../util/e2e-test-utils';

test.describe('manage: organization', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();

  test('live', async ({ page }) => {
    await page.goto('/manage/super-sprinkles');
    await expect(
      page.getByRole('heading', { name: 'Super Sprinkles Racing' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('new', async ({ page }) => {
    await page.goto('/manage/organization/new');
    await expect(
      page.getByRole('heading', { name: 'Create Organization' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('edit', async ({ page }) => {
    await page.goto('/manage/super-sprinkles/edit');
    await expect(
      page.getByRole('heading', { name: 'Edit Organization' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Super Sprinkles Racing', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
