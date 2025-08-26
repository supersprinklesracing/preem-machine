'use server';

import { verifyAuthUser } from '@/auth/user';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function incrementCounter() {
  const authUser = await verifyAuthUser();

  if (!authUser) {
    throw new Error('Cannot update counter of unauthenticated user');
  }

  const db = await getFirestore();
  const snapshot = await db.collection('user-counters').doc(authUser.uid).get();

  const currentUserCounter = snapshot.data();

  if (!snapshot.exists || !currentUserCounter) {
    const userCounter = {
      id: authUser.uid,
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
