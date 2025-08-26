import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/');
}

export async function loadTestData(page: Page) {
  await page.request.post('/api/debug/test/load-firestore-test-data');
}
