import { signInWithCustomToken } from 'firebase/auth';
import { getValidCustomToken } from 'next-firebase-auth-edge/lib/next/client';

import { getFirebaseAuth, getFirestore } from '@/firebase-client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const auth = getFirebaseAuth();

export async function incrementCounterUsingClientFirestore(
  serverCustomToken: string,
) {
  // We use `getValidCustomToken` to fetch fresh `customToken` using /api/refresh-token endpoint if original custom token has expired.
  // This ensures custom token is valid, even in long-running client sessions
  const customToken = await getValidCustomToken({
    serverCustomToken,
    refreshTokenUrl: '/api/refresh-token',
  });

  if (!customToken) {
    throw new Error('Invalid custom token');
  }

  const { user: firebaseUser } = await signInWithCustomToken(auth, customToken);

  const docRef = doc(getFirestore(), 'user-counters', firebaseUser.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    await updateDoc(docRef, { count: data.count + 1 });
  } else {
    await setDoc(docRef, { count: 1 });
  }
}
