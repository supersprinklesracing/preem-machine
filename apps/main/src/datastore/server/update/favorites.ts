'use server';

import { getFirestore } from '@/firebase/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyUserContext } from '@/user/server/user';

interface DocRef {
  id: string;
  path: string;
}

export async function addFavorite(docRef: DocRef) {
  const { user } = await verifyUserContext();
  if (!user) {
    throw new Error('User not found');
  }

  const firestore = await getFirestore();
  const userRef = firestore.collection('users').doc(user.id);
  await userRef.update({
    favoriteRefs: FieldValue.arrayUnion(docRef),
  });
}

export async function removeFavorite(docRef: DocRef) {
  const { user } = await verifyUserContext();
  if (!user) {
    throw new Error('User not found');
  }

  const firestore = await getFirestore();
  const userRef = firestore.collection('users').doc(user.id);
  await userRef.update({
    favoriteRefs: FieldValue.arrayRemove(docRef),
  });
}
