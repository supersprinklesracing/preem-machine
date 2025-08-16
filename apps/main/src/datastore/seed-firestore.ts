import { getFirestore } from '@/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { createMockDb } from './mock-db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockDbObject = { [key: string]: any };

async function seedCollection(
  db: FirebaseFirestore.Firestore,
  collectionPath: string,
  collectionData: MockDbObject
) {
  const collectionRef = db.collection(collectionPath);
  const promises: Promise<unknown>[] = [];

  for (const docId in collectionData) {
    const { _collections, ...docData } = collectionData[docId];
    promises.push(collectionRef.doc(docId).set(docData));

    if (_collections) {
      for (const subCollectionId in _collections) {
        promises.push(
          seedCollection(
            db,
            `${collectionPath}/${docId}/${subCollectionId}`,
            _collections[subCollectionId]
          )
        );
      }
    }
  }

  await Promise.all(promises);
  console.log(`Seeded collection: ${collectionPath}`);
}

/**
 * Seeds the entire Firestore database based on the MOCK_DB structure.
 * This will overwrite existing data in the specified collections.
 */
export async function seedFirestore(firestore: Firestore) {
  try {
    const db = await getFirestore();
    console.log('Starting Firestore database seeding...');
    const mockDb = createMockDb(db);

    const promises: Promise<unknown>[] = [];

    const collectionIds = Object.keys(mockDb) as (keyof typeof mockDb)[];
    for (const collectionId of collectionIds) {
      const collectionData = mockDb[collectionId];
      if (collectionData) {
        promises.push(seedCollection(db, String(collectionId), collectionData));
      }
    }

    await Promise.all(promises);
    console.log('OK! Firestore database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
    throw error;
  }
}
