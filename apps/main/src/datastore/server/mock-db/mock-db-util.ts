'use server-only';

import { Firestore } from 'firebase-admin/firestore';
import { postProcessDatabase } from './mock-db-processor';
import { mockDbData } from '../../mock-db';

export const createMockDb = (firestore: Firestore) => {
  return postProcessDatabase(mockDbData, firestore);
};
