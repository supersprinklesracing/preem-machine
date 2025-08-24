import { createMockDb } from '@/datastore/mock-db';
import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

describe('firestore-mocks', () => {
  let firestore: Firestore;
  beforeAll(async () => {
    firestore = await getFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firestore as unknown as any).database = createMockDb(firestore);
  });
  it('Basic query', async () => {
    const querySnapshot = await firestore.collection('users').get();
    expect(querySnapshot.size).toBe(5);
  });
});
