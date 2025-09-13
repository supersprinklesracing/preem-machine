import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';

test.describe('manage: event', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025',
    );
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test('new', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event/new',
    );
    await expect(
      page.getByRole('heading', { name: 'Create Event' }),
    ).toBeVisible();
    // TODO: Look for the parent document in the dom.
    await expect(page).toHaveScreenshot();
  });

  test('edit', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/edit',
    );
    await expect(
      page.getByRole('heading', { name: 'Edit Event' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
