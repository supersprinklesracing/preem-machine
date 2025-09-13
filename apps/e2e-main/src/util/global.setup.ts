import { expect, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const url = `${baseURL}/api/debug/test/load-firestore-test-data`;

  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) {
    throw new Error(
      `Failed to seed database. Status: ${
        response.status
      }. Body: ${await response.text()}`,
    );
  }
  const body = await response.json();
  expect(body.success).toBe(true);
}

export default globalSetup;
