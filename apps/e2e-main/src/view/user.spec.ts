import { expect, test } from '@playwright/test';
import { useMockedDateBeforeEach } from '../util/e2e-test-utils';

test.describe('view: user', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/user/user-alex-doe');
    await expect(page.getByRole('heading', { name: 'Alex Doe' })).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
