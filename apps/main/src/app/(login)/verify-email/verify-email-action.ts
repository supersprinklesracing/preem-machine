'use server';

import { getAuthUser } from '@/auth/server/auth';
import { createVerificationEmail } from '@/datastore/server/create/mail';

export async function resendVerificationEmail() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error('You must be logged in to resend a verification email.');
  }
  if (!authUser.email) {
    throw new Error('User does not have an email to verify.');
  }

  await createVerificationEmail(authUser.email);
}