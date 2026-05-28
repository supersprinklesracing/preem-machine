import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';
import { expect, test } from '../util/fixtures';

test.describe('manage: race', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto('/manage/race?path=races/masters-women');
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('new', async ({ page }) => {
    await page.goto('/manage/race/new?path=events/giro-sf-2025');
    await expect(
      page.getByRole('heading', { name: 'Create Race' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('edit', async ({ page }) => {
    await page.goto('/manage/race/edit?path=races/masters-women');
    await expect(
      page.getByRole('heading', { name: 'Edit Race' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
