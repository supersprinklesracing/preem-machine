'use server';

import {
  DocumentData,
  type DocumentReference,
  FieldValue,
} from 'firebase-admin/firestore';
import Stripe from 'stripe';

import { AuthUser } from '@/auth/user';
import {
  getFirebaseAuthAdmin,
  getFirestore,
} from '@/firebase/server/firebase-admin';

import { NotFoundError, unauthorized } from '../../errors';
import {
  type Event,
  EventSchema,
  type Organization,
  OrganizationSchema,
  type Preem,
  PreemSchema,
  type Race,
  RaceSchema,
  type Series,
  SeriesSchema,
  type User,
  UserSchema,
} from '../../schema';
import { isUserAuthorized } from '../access';
import { getDoc } from '../query/query';
import { getDocRefInternal } from '../util';
import { validateEventDateRange, validateRaceDateRange } from '../validation';

interface DocUpdate<T> {
  ref: DocumentReference<T>;
  updates: Partial<T>;
}

const getUpdateMetadata = (userRef: DocumentReference<DocumentData>) => ({
  'metadata.lastModified': new Date(),
  'metadata.lastModifiedBy': userRef,
});

export const updateUser = async (
  user: Partial<Pick<User, 'name' | 'address'>>,
  authUser: AuthUser,
) => {
  const path = `users/${authUser.uid}`;

  const docRef = await getDocRefInternal(UserSchema, path);
  await docRef.update({
    ...user,
    ...getUpdateMetadata(docRef),
  });

  const auth = await getFirebaseAuthAdmin();
  await auth.updateUser(authUser.uid, {
    displayName: user.name,
  });
};

export const updateUserAvatar = async (
  { avatarUrl }: Pick<User, 'avatarUrl'>,
  authUser: AuthUser,
) => {
  const path = `users/${authUser.uid}`;

  const docRef = await getDocRefInternal(UserSchema, path);
  await docRef.update({
    avatarUrl: avatarUrl || FieldValue.delete(),
    ...getUpdateMetadata(docRef),
  });

  const auth = await getFirebaseAuthAdmin();
  await auth.updateUser(authUser.uid, {
    photoURL: avatarUrl || null,
  });
};

export const updateOrganizationStripeConnectAccount = async (
  organizationId: string,
  account: Stripe.Account,
  authUser: AuthUser,
) => {
  const path = `organizations/${organizationId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = await getDocRefInternal(OrganizationSchema, path);
  const userRef = db.collection('users').doc(authUser.uid);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    ...getUpdateMetadata(userRef),
  });
};

export const updateOrganizationStripeConnectAccountForWebhook = async (
  organizationId: string,
  account: Stripe.Account,
) => {
  const orgRef = await getDocRefInternal(
    OrganizationSchema,
    `organizations/${organizationId}`,
  );
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metadata.lastModified': FieldValue.serverTimestamp(),
  });
};

export const updateOrganization = async (
  path: string,
  updates: Partial<Pick<Organization, 'name' | 'website' | 'description'>>,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRefInternal(OrganizationSchema, path);
    const doc = await transaction.get(ref);
    if (!doc.exists) {
      throw new NotFoundError("Organization doesn't exist");
    }
    transaction.update(ref, updates);

    return [{ ref, updates }];
  });
};

export const updateSeries = async (
  path: string,
  updates: Partial<
    Pick<
      Series,
      'name' | 'website' | 'location' | 'description' | 'startDate' | 'endDate'
    >
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRefInternal(SeriesSchema, path);
    const doc = await transaction.get(ref);
    if (!doc.exists) {
      throw new NotFoundError("Series doesn't exist");
    }
    transaction.update(ref, updates);

    return [{ ref, updates }];
  });
};

export const updateEvent = async (
  path: string,
  updates: Partial<
    Pick<
      Event,
      'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
    >
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRefInternal(EventSchema, path);
    const doc = await transaction.get(ref);
    if (!doc.exists) {
      throw new NotFoundError("Event doesn't exist");
    }
    const series = await getDoc(SeriesSchema, `series/${doc.data()?.seriesId}`);
    await validateEventDateRange(updates, series.path);
    transaction.update(ref, updates);

    return [{ ref, updates }];
  });
};

export const updateRace = async (
  path: string,
  updates: Partial<
    Pick<Race, 'name' | 'location' | 'description' | 'startDate' | 'endDate'>
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRefInternal(RaceSchema, path);
    const doc = await transaction.get(ref);
    if (!doc.exists) {
      throw new NotFoundError("Race doesn't exist");
    }
    const event = await getDoc(EventSchema, `events/${doc.data()?.eventId}`);
    await validateRaceDateRange(updates, event.path);
    transaction.update(ref, updates);

    return [{ ref, updates }];
  });
};

export const updatePreem = async (
  path: string,
  updates: Partial<Pick<Preem, 'name' | 'description'>>,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRefInternal(PreemSchema, path);
    const doc = await transaction.get(ref);
    if (!doc.exists) {
      throw new NotFoundError("Preem doesn't exist");
    }
    transaction.update(ref, updates);

    return [{ ref, updates }];
  });
};
