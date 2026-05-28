'use server';

import {
  type DocumentData,
  type DocumentReference,
} from 'firebase-admin/firestore';

import { AuthUser } from '@/auth/user';

import { unauthorized } from '../../errors';
import { asDocPath, CollectionPath, docId, DocPath } from '../../paths';
import {
  type Contribution,
  ContributionSchema,
  Event,
  EventSchema,
  Invite,
  InviteSchema,
  Organization,
  OrganizationSchema,
  Preem,
  PreemSchema,
  Race,
  RaceSchema,
  Series,
  SeriesSchema,
  User,
  UserSchema,
} from '../../schema';
import { isUserAuthorized } from '../access';
import { getDoc } from '../query/query';
import { getCollectionRefInternal, getDocRefInternal } from '../util';
import { validateEventDateRange, validateRaceDateRange } from '../validation';

const getCreateMetadata = (userRef: DocumentReference<DocumentData>) => ({
  metadata: {
    created: new Date(),
    lastModified: new Date(),
    createdBy: userRef,
    lastModifiedBy: userRef,
  },
});

export const createUser = async (
  newUserEdits: Pick<User, 'name' | 'avatarUrl'>,
  authUser: AuthUser,
) => {
  const path = `users/${authUser.uid}`;
  const newUserRef = await getDocRefInternal(UserSchema, path);

  const newUserDetails = await newUserRef.firestore.runTransaction(
    async (transaction) => {
      const invitesByEmailSnapshot = await (
        await getCollectionRefInternal(InviteSchema, 'invites')
      )
        .where('email', '==', authUser.email)
        .where('status', '==', 'pending')
        .get();
      const invitesByUidSnapshot = await (
        await getCollectionRefInternal(InviteSchema, 'invites')
      )
        .where('uid', '==', authUser.uid)
        .where('status', '==', 'pending')
        .get();

      const allInvites = [
        ...invitesByEmailSnapshot.docs,
        ...invitesByUidSnapshot.docs,
      ];

      const organizationRefsMap = new Map<
        string,
        { id: string; path: string }
      >();

      allInvites.forEach((doc) => {
        (doc.data().organizationRefs ?? []).forEach((orgRef) => {
          organizationRefsMap.set(orgRef.path, orgRef);
        });
        transaction.update(doc.ref, { status: 'accepted' });
      });

      const newUser: User = {
        ...newUserEdits,
        id: newUserRef.id,
        path: asDocPath(newUserRef.path),
        organizationRefs: Array.from(organizationRefsMap.values()),
        ...getCreateMetadata(newUserRef),
      };

      transaction.set(newUserRef, newUser);
      return newUser;
    },
  );
  return { newUserDetails, newUser: await newUserRef.get() };
};

export const createOrganization = async (
  path: CollectionPath,
  organization: Pick<Organization, 'name'>,
  authUser: AuthUser,
) => {
  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const ref = (
    await getCollectionRefInternal(OrganizationSchema, 'organizations')
  ).doc();
  const newOrganization = {
    ...organization,
    id: ref.id,
    path: asDocPath(ref.path),
    ...getCreateMetadata(userRef),
  };
  await ref.set(newOrganization);
  return ref.get();
};

export const createSeries = async (
  path: CollectionPath,
  series: Pick<
    Series,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const organizationId = docId(path);
  const ref = (await getCollectionRefInternal(SeriesSchema, 'series')).doc();
  const newSeries = {
    ...series,
    id: ref.id,
    path: asDocPath(ref.path),
    organizationId,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newSeries);
  return ref.get();
};

export const createEvent = async (
  path: CollectionPath,
  event: Pick<
    Event,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const series = await getDoc(SeriesSchema, path);
  await validateEventDateRange(event, series.path);
  const ref = (await getCollectionRefInternal(EventSchema, 'events')).doc();
  const newEvent = {
    ...event,
    id: ref.id,
    path: asDocPath(ref.path),
    seriesId: series.id,
    organizationId: series.organizationId,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newEvent);
  return ref.get();
};

export const createRace = async (
  path: CollectionPath,
  race: Pick<
    Race,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const event = await getDoc(EventSchema, path);
  await validateRaceDateRange(race, event.path);
  const ref = (await getCollectionRefInternal(RaceSchema, 'races')).doc();
  const newRace = {
    ...race,
    id: ref.id,
    path: asDocPath(ref.path),
    eventId: event.id,
    organizationId: event.organizationId,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newRace);
  return ref.get();
};

export const createPreem = async (
  path: DocPath,
  preem: Pick<Preem, 'name' | 'description'>,
  authUser: AuthUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const race = await getDoc(RaceSchema, path);
  const ref = (await getCollectionRefInternal(PreemSchema, 'preems')).doc();
  const newPreem = {
    ...preem,
    id: ref.id,
    path: asDocPath(ref.path),
    raceId: race.id,
    organizationId: race.organizationId,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newPreem);
  return ref.get();
};

export const createPendingContribution = async (
  path: CollectionPath,
  contribution: Pick<Contribution, 'amount' | 'message' | 'isAnonymous'>,
  authUser: AuthUser,
) => {
  if (!authUser.uid) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const preem = await getDoc(PreemSchema, path);
  const ref = (
    await getCollectionRefInternal(ContributionSchema, 'contributions')
  ).doc();
  const newContribution = {
    ...contribution,
    id: ref.id,
    path: asDocPath(ref.path),
    status: 'pending',
    preemId: preem.id,
    organizationId: preem.organizationId,
    userId: authUser.uid,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newContribution);
  return ref.get();
};

export const createInvite = async (
  invite: Pick<Invite, 'email' | 'uid' | 'organizationRefs'>,
  authUser: AuthUser,
) => {
  const authChecks = await Promise.all(
    invite.organizationRefs.map((orgRef) =>
      isUserAuthorized(authUser, orgRef.path),
    ),
  );

  if (authChecks.some((isAuth) => !isAuth)) {
    unauthorized();
  }

  const userRef = await getDocRefInternal(UserSchema, `users/${authUser.uid}`);
  const ref = (await getCollectionRefInternal(InviteSchema, 'invites')).doc();
  const newInvite = {
    ...invite,
    id: ref.id,
    path: asDocPath(ref.path),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: 'pending' as any,
    ...getCreateMetadata(userRef),
  };
  await ref.set(newInvite);
  return ref.get();
};
