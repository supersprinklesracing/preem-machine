import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from './util/e2e-test-utils';

test.describe('home', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    page.on('request', (request) =>
      console.log('>>', request.method(), request.url()),
    );
    page.on('response', (response) =>
      console.log('<<', response.status(), response.url()),
    );
    await page.goto('/home');
    await expect(
      page.getByRole('heading', { name: 'Current & Upcoming Preems' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Upcoming Events' }),
    ).toBeVisible();
    await expect(page.getByText('First Lap Leader').first()).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
