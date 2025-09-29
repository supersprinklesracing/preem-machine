'use server-only';

import { Firestore } from 'firebase-admin/firestore';

import { mockDbData } from '../../mock-db';
import { postProcessDatabase } from './mock-db-processor';

export const createMockDb = (firestore: Firestore) => {
  return postProcessDatabase(mockDbData, firestore);
};
