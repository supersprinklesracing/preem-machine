'use server';

import {
  getFirebaseAdminApp,
  getFirebaseStorage,
} from '@/firebase/server/firebase-admin';
import { verifyUserContext } from '@/user/server/user';
import { randomUUID } from 'crypto';

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
  const uid = (await verifyUserContext()).authUser.uid;

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

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  return { signedUrl, publicUrl };
}
