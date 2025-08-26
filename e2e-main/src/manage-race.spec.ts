import { test, expect } from '@playwright/test';

test.describe('Race Management Page', () => {
  test.beforeEach(async ({ page }) => {
    // Load test data
    await page.request.post('/api/debug/test/load-firestore-test-data');

    // Log in
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('/');
  });

  test('should display race information and preems', async ({ page }) => {
    await page.goto('/manage/race/race-giro-sf-2025-masters-women');

    // Assert race name
    await expect(
      page.getByRole('heading', { name: 'Giro SF 2025 - Masters Women' })
    ).toBeVisible();
    await expect(
      page.getByText('Giro SF 2025 - Masters Women')
    ).toBeVisible();

    // Assert race details
    await expect(page.getByText('Date:')).toBeVisible();
    await expect(page.getByText('Location:')).toBeVisible();

    // Assert preem table
    const preemTable = page.getByRole('grid');
    await expect(preemTable).toBeVisible();
    const rows = preemTable.getByRole('row');
    // Expecting header row + at least one data row
    await expect(rows).toHaveCountGreaterThan(1);
  });
});
