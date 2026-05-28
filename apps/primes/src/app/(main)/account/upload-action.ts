'use server';

import { randomUUID } from 'crypto';

import {
  getFirebaseAdminApp,
  getFirebaseStorage,
} from '@/firebase/server/firebase-admin';
import { requireLoggedInUserContext } from '@/user/server/user';

interface SignedUrlOptions {
  contentType: string;
}

interface SignedUrlResult {
  signedUrl: string;
  publicUrl: string;
}

export async function generateSignedUploadUrl({
  contentType,
}: SignedUrlOptions): Promise<SignedUrlResult> {
  const uid = (await requireLoggedInUserContext()).authUser.uid;

  await getFirebaseAdminApp();
  const bucket = (await getFirebaseStorage()).bucket();
  const photoId = randomUUID();
  const filePath = `users/photos/${uid}/${photoId}`;

  const [signedUrl] = await bucket.file(filePath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  const encodedFilePath = encodeURIComponent(filePath);

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFilePath}?alt=media`;

  return { signedUrl, publicUrl };
}
