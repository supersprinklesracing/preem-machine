'use server-only';

import { Firestore } from 'firebase-admin/firestore';

import { mockDbData } from '../../mock-db';
import { postProcessDatabase } from './mock-db-processor';

export const createMockDb = (firestore: Firestore) => {
  // Use a deep copy of the mock data to ensure test isolation.
  return postProcessDatabase(JSON.parse(JSON.stringify(mockDbData)), firestore);
};
