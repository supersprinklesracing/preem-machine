'use server';

import { getUserFromCookies } from '@/auth/user';
import { getFirebaseAdminApp } from '@/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function incrementCounter() {
  const user = await getUserFromCookies();

  if (!user) {
    throw new Error('Cannot update counter of unauthenticated user');
  }

  const db = getFirestore(await getFirebaseAdminApp());
  const snapshot = await db.collection('user-counters').doc(user.uid).get();

  const currentUserCounter = snapshot.data();

  if (!snapshot.exists || !currentUserCounter) {
    const userCounter = {
      id: user.uid,
      count: 1,
    };

    await snapshot.ref.create(userCounter);
  }

  const newUserCounter = {
    ...currentUserCounter,
    count: currentUserCounter?.count + 1,
  };
  await snapshot.ref.update(newUserCounter);

  revalidatePath('/');
}
