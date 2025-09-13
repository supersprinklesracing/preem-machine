import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';

test.describe('manage: race', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women',
    );
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('new', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race/new',
    );
    await expect(
      page.getByRole('heading', { name: 'Create Race' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('edit', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/edit',
    );
    await expect(
      page.getByRole('heading', { name: 'Edit Race' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
