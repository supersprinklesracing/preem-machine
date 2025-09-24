import { getFirestore } from '@/firebase/server/firebase-admin';
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
 * Deletes all documents in a collection and all their subcollections.
 */
async function clearCollection(
  db: FirebaseFirestore.Firestore,
  collectionPath: string,
) {
  const collectionRef = db.collection(collectionPath);
  const querySnapshot = await collectionRef.get();

  if (querySnapshot.size === 0) {
    return;
  }

  const batch = db.batch();
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log(`Deleted all documents in collection: ${collectionPath}`);
}

/**
 * Clears the entire Firestore database.
 */
async function clearFirestore(db: FirebaseFirestore.Firestore) {
  console.log('Clearing Firestore database...');
  const collections = await db.listCollections();
  for (const collection of collections) {
    await clearCollection(db, collection.id);
  }
  console.log('OK! Firestore database cleared.');
}

/**
 * Seeds the entire Firestore database based on the MOCK_DB structure.
 */
export async function seedFirestore() {
  try {
    const db = await getFirestore();
    await clearFirestore(db);
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
