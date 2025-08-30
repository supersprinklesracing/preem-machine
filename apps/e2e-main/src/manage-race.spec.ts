import { test, expect } from '@playwright/test';
import { loadTestData, login } from './utils';

test.describe('Manage Race', () => {
  test.beforeEach(async ({ page }) => {
    await loadTestData(page);
    await login(page);
  });

  test('should display race details', async ({ page }) => {
    await page.goto('/manage/race/race-giro-sf-2025-masters-women');

    await expect(page.getByRole('heading', { name: 'Giro di San Francisco - 2025' })).toBeVisible();

    // check for race details
    await expect(page.getByText('August 31, 2025')).toBeVisible();
    await expect(page.getByText('Levi\'s Gran Fondo')).toBeVisible();
    await expect(page.getByText('Masters Women')).toBeVisible();

    // check for preems table
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Preem' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Laps' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Carry' })).toBeVisible();
  });
});
