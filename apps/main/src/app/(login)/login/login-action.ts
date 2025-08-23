'use server';

import { authConfigFn } from '@/firebase-admin/config';
import { getFirebaseAuth } from '@/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { refreshCookiesWithIdToken } from 'next-firebase-auth-edge/lib/next/cookies';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(username: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    username,
    password,
  );
  console.log('Able to get credential', credential);

  const idToken = await credential.user.getIdToken();
  console.log('Able to get id Token', idToken);
  await refreshCookiesWithIdToken(
    idToken,
    await headers(),
    await cookies(),
    await authConfigFn(),
  );
  console.log('Able to refresh cookies');
  redirect('/');
}
