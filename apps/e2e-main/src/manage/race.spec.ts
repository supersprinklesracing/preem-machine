import { expect, test } from '../fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from '../util/e2e-test-utils';

test.describe('manage: race', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();

  test('live', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women',
    );
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('new', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/race/new',
    );
    await expect(
      page.getByRole('heading', { name: 'Create Race' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('edit', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/edit',
    );
    await expect(
      page.getByRole('heading', { name: 'Edit Race' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
