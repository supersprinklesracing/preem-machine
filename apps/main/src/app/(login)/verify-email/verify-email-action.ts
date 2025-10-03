'use server';

import { getAuth } from 'firebase-admin/auth';

import { getAuthUser } from '@/auth/server/auth';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

export async function resendVerificationEmail() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Error('You must be logged in to resend a verification email.');
  }

  const app = getFirebaseAdminApp();
  const auth = getAuth(app);
  const link = await auth.generateEmailVerificationLink(authUser.email as string);
  // How to send the email?
  // The firestore-send-email extension is used in this project.
  // I will add a document to the `mail` collection.
  const { getFirestore } = await import('firebase-admin/firestore');
  const db = getFirestore(app);
  await db.collection('mail').add({
    to: authUser.email,
    message: {
      subject: 'Verify your email for Preem Machine',
      html: `Please verify your email by clicking this link: <a href="${link}">${link}</a>`,
    },
  });
}