import { incrementCounter } from '@/actions/user-counters';
import { getAuthUserFromCookies } from '@/auth/user';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import Account from './Account';
import { updateUserAction } from './update-user-action';

async function getUserCounter(): Promise<number> {
  const authUser = await getAuthUserFromCookies();
  const db = await getFirestore();

  if (!authUser) {
    throw new Error('Cannot get counter of unauthenticated user');
  }

  const snapshot = await db.collection('user-counters').doc(authUser.uid).get();

  const currentUserCounter = snapshot.data();

  if (!currentUserCounter) {
    return 0;
  }

  return currentUserCounter.count;
}

export default async function AccountPage() {
  const count = await getUserCounter();

  return (
    <Account
      debugProps={{ count, incrementCounter }}
      updateUserAction={updateUserAction}
    />
  );
}
