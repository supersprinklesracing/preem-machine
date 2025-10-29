import { getFirestore } from '@/firebase/server/firebase-admin';
import { setupMockDb } from '@/test-utils';

import { MOCK_USER_1 } from '../../mock-db';

describe('Mock DB Isolation Test', () => {
  setupMockDb();

  it('should modify user data in the first test', async () => {
    const firestore = getFirestore();
    const userRef = firestore.collection('users').doc(MOCK_USER_1.id);

    // Verify the initial state
    const initialDoc = await userRef.get();
    expect(initialDoc.data()?.name).toBe('Test User 1');

    // Modify the data
    await userRef.update({ name: 'Modified Name' });

    // Verify the modification
    const updatedDoc = await userRef.get();
    expect(updatedDoc.data()?.name).toBe('Modified Name');
  });

  it('should see the original user data in the second test', async () => {
    const firestore = getFirestore();
    const userRef = firestore.collection('users').doc(MOCK_USER_1.id);

    // This test will fail if the database is not reset between tests
    const doc = await userRef.get();
    expect(doc.data()?.name).toBe('Test User 1');
  });
});
