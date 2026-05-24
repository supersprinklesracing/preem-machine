'use server';

import { signIn } from '@/auth';

export async function loginAction(username: string, password: string) {
  await signIn('credentials', {
    email: username,
    password,
    redirectTo: '/',
  });
}
