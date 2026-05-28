'use server';

import { revalidatePath } from 'next/cache';

import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

export async function makeAdmin(userId: string) {
  const app = await getFirebaseAdminApp();
  const auth = app.auth();
  const user = await auth.getUser(userId);
  const existingClaims = user.customClaims || {};

  const roles = Array.isArray(existingClaims.roles) ? existingClaims.roles : [];

  if (roles.includes('admin')) {
    // The user is already an admin, no need to update claims.
    return;
  }

  const newRoles = [...roles, 'admin'];
  const mergedClaims = { ...existingClaims, roles: newRoles };

  await auth.setCustomUserClaims(userId, mergedClaims);
  revalidatePath('/admin');
}
