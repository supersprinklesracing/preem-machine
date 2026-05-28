import type { DocumentReference } from 'firebase-admin/firestore';

import { asDocPath } from '../paths';
import type { Organization, User } from '../schema';
import { getConfiguredFirestore } from './config';

export async function isUserAuthorized(
  authUser: { readonly uid: string },
  path: string,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: { readonly uid: string },
  docRef: DocumentReference,
): Promise<boolean>;
export async function isUserAuthorized(
  authUser: { readonly uid: string },
  docRefOrPath: DocumentReference | string,
): Promise<boolean> {
  const db = await getConfiguredFirestore();
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

  let orgId: string | undefined;

  if (rootRef.path.startsWith('organizations')) {
    orgId = rootRef.id;
  } else if (
    rootRef.path.startsWith('series') ||
    rootRef.path.startsWith('events') ||
    rootRef.path.startsWith('races') ||
    rootRef.path.startsWith('preems') ||
    rootRef.path.startsWith('contributions')
  ) {
    orgId = rootDoc.data()?.organizationId;
  }

  if (orgId) {
    const orgDoc = await db.doc(`organizations/${orgId}`).get();
    if (!orgDoc.exists) return false;
    const orgData = orgDoc.data() as Organization;
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
