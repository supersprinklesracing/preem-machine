import { getFirestore } from '@/firebase/server';
import type { Firestore } from 'firebase-admin/firestore';
import { createMockDb } from './mock-db-util';
import { DatabaseDocument } from './mock-db-processor';

async function seedCollection(
  db: FirebaseFirestore.Firestore,
  collectionPath: string,
  docs: DatabaseDocument[],
) {
  const collectionRef = db.collection(collectionPath);
  const promises: Promise<unknown>[] = [];

  for (const docId in docs) {
    const { _collections, ...docData } = docs[docId];
    const id = docData.id;
    try {
      promises.push(collectionRef.doc(id).set(docData));
    } catch (e) {
      console.error('Failed to push: ', JSON.stringify(docData), e);
    }

    if (_collections) {
      for (const subCollectionId in _collections) {
        const docs = _collections[subCollectionId];
        if (!docs) {
          continue;
        }
        promises.push(
          seedCollection(
            db,
            `${collectionPath}/${id}/${subCollectionId}`,
            docs,
          ),
        );
      }
    }
  }

  await Promise.all(promises);
  console.log(`Seeded collection: ${collectionPath}`);
}

/**
 * Seeds the entire Firestore database based on the MOCK_DB structure.
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
