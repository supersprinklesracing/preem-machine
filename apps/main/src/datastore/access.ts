'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin';
import type { DocumentReference } from 'firebase-admin/firestore';
import { organizationPath } from './paths';
import type { Organization, User } from './types';

export async function isUserAuthorized(
  authUser: AuthContextUser,
  path: string,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: AuthContextUser,
  docRef: DocumentReference,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: AuthContextUser,
  docRefOrPath: DocumentReference | string,
): Promise<boolean> {
  const db = await getFirestore();
  const docRef =
    typeof docRefOrPath === 'string' ? db.doc(docRefOrPath) : docRefOrPath;

  console.debug(
    `isUserAuthorizedToEdit: Checking ${authUser.uid} editing ${docRef.path}...`,
  );

  const doc = await docRef.get();
  if (!doc.exists) {
    console.debug('isUserAuthorizedToEdit: No such document.');
    return false;
  }
  const canonicalDocRef = doc.ref;
  if (canonicalDocRef.path !== docRef.path) {
    console.debug('isUserAuthorizedToEdit: Path mismatch.');
    return false;
  }

  const pathSegments = canonicalDocRef.path.split('/');
  if (pathSegments.length < 2) {
    console.debug('isUserAuthorizedToEdit: Invalid path.');
    return false;
  }
  const rootPath = organizationPath(canonicalDocRef.path);

  const rootRef = db.doc(rootPath);
  const rootDoc = await rootRef.get();

  if (!rootDoc.exists) {
    console.debug('isUserAuthorizedToEdit: No such root document.');
    return false;
  }

  if (rootRef.path.startsWith('organizations')) {
    const orgData = rootDoc.data() as Organization;
    console.log(orgData);
    console.log(orgData?.memberRefs?.map((m) => m.id));
    return (
      orgData?.memberRefs?.some((member) => member.id === authUser.uid) ?? false
    );
  } else if (rootRef.path.startsWith('users')) {
    const userData = rootDoc.data() as User;
    console.log(userData);
    return userData.id === authUser.uid;
  } else {
    return false;
  }
}
