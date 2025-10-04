'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

export const createVerificationEmail = async (email: string) => {
  const app = await getFirebaseAdminApp();
  const auth = getAuth(app);
  const link = await auth.generateEmailVerificationLink(email);
  const db = getFirestore(app);
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Verify your email for Preem Machine',
      html: `Please verify your email by clicking this link: <a href="${link}">${link}</a>`,
    },
  });
};