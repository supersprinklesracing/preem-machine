import 'server-only';

import { getFirestore } from '@/firebase/server/firebase-admin';

import { User, UserSchema } from '../../schema';
import { converter } from '../converters';

export const getUserForAuth = async (id: string): Promise<User | null> => {
  const db = await getFirestore();
  const docSnap = await db
    .collection('users')
    .doc(id)
    .withConverter(converter(UserSchema))
    .get();
  const docData = docSnap.data();
  if (!docData) {
    return null;
  }
  return docData;
};
