'use server';

import { AuthUser } from '@/auth/user';
import { getFirestore } from '@/firebase/server';
import type { DocumentReference } from 'firebase-admin/firestore';
import { asDocPath } from '../paths';
import type { Organization, User } from '../schema';

export async function isUserAuthorized(
  authUser: AuthUser,
  path: string,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: AuthUser,
  docRef: DocumentReference,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: AuthUser,
  docRefOrPath: DocumentReference | string,
): Promise<boolean> {
  const db = await getFirestore();
  const docRef =
    typeof docRefOrPath === 'string'
      ? db.doc(asDocPath(docRefOrPath))
      : docRefOrPath;

  console.debug(
    `isUserAuthorized: Checking ${authUser.uid} for ${docRef.path}...`,
  );

  const rootPath = docRef.path.split('/').slice(0, 2).join('/');
  const rootRef = db.doc(rootPath);
  const rootDoc = await rootRef.get();

  if (!rootDoc.exists) {
    console.debug('isUserAuthorized: No such org document.');
    return false;
  }

  if (rootRef.path.startsWith('organizations')) {
    const orgData = rootDoc.data() as Organization;
    return (
      orgData?.memberRefs?.some((member) => member.id === authUser.uid) ?? false
    );
  }
  if (rootRef.path.startsWith('users')) {
    const userData = rootDoc.data() as User;
    return userData.id === authUser.uid;
  }

  return false;
}
