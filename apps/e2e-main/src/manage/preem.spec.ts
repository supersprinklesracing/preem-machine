import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';
import { expect, test } from '../util/fixtures';

test.describe('manage: preem', () => {
  useE2eTestingUserBeforeEach();

  test('live', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap',
    );
    await expect(
      page.getByRole('heading', { name: 'First Lap Leader', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('new', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/preem/new',
    );
    await expect(
      page.getByRole('heading', { name: 'Create Preem' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('edit', async ({ page }) => {
    await page.goto(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap/edit',
    );
    await expect(
      page.getByRole('heading', { name: 'Edit Preem' }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId('preem-card-first-lap')
        .getByRole('heading', { name: 'First Lap Leader', level: 3 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
