import { getFirestore } from '@/firebase-admin';
import { setupMockDb } from '@/test-utils';
import type { Firestore } from 'firebase-admin/firestore';

describe('firestore-mocks', () => {
  let firestore: Firestore;
  setupMockDb();

  beforeAll(async () => {
    firestore = await getFirestore();
  });
  it('Basic query', async () => {
    const querySnapshot = await firestore.collection('users').get();
    expect(querySnapshot.size).toBe(7);
  });
});
