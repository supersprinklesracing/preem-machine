import { UserCredential } from 'firebase/auth';
import { signIn, signOut } from 'next-auth/react';

export async function login(token: string) {
  await signIn('credentials', { token, redirect: false });
}

export async function loginWithCredential(credential: UserCredential) {
  const idToken = await credential.user.getIdToken();
  await login(idToken);
}

export async function logout() {
  await signOut({ redirect: true, callbackUrl: '/login' });
}
