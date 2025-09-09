'use server';

import { createMockData } from '@/datastore/mock-db';
import { mockGoogleCloudFirestore } from 'firestore-jest-mock';
import { Timestamp, DocumentReference, Firestore } from 'firebase-admin/firestore';

const createDocRef = <T>(
  firestore: Firestore,
  collection: string,
  id: string,
): DocumentReference<T> => {
  return firestore.doc(`${collection}/${id}`) as DocumentReference<T>;
};

function hydrate(data: any, firestore: Firestore): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(data)) {
      return Timestamp.fromDate(new Date(data));
    }

    if (Array.isArray(data)) {
      return data.map((item) => hydrate(item, firestore));
    }

    if (typeof data === 'object') {
      const newData: { [key: string]: any } = {};
      for (const key in data) {
        if (key.endsWith('Refs')) {
            const collection = key.slice(0, -4);
            newData[key] = data[key].map((id: string) => createDocRef(firestore, collection, id));
        } else if (key.endsWith('Ref')) {
            const collection = key.slice(0, -3);
            newData[key] = createDocRef(firestore, collection, data[key]);
        } else {
          newData[key] = hydrate(data[key], firestore);
        }
      }
      return newData;
    }

    return data;
}

export const setupServerMockDb = () => {
  const rawData = createMockData();
  const { Firestore } = require('@google-cloud/firestore');
  const dummyFirestore = new Firestore();
  const hydratedData = hydrate(rawData, dummyFirestore);

  mockGoogleCloudFirestore({
    database: hydratedData,
  }, {
    simulateQueryFilters: true,
  });
};
