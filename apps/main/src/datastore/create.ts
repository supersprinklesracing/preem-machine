'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
} from 'firebase-admin/firestore';

import { isUserAuthorized } from './access';
import { converter } from './converter';
import { unauthorized } from './errors';
import { DocPath, asDocPath } from './paths';
import type {
  Event,
  EventBrief,
  Organization,
  OrganizationBrief,
  Preem,
  Race,
  RaceBrief,
  Series,
  SeriesBrief,
  User,
} from './schema';

const createMetadata = (userRef: DocumentReference<DocumentData>) => ({
  'metadata.created': FieldValue.serverTimestamp(),
  'metadata.createdBy': userRef,
  'metadata.lastModified': FieldValue.serverTimestamp(),
  'metadata.lastModifiedBy': userRef,
});

const createDocument = async <U>(
  path: DocPath,
  data: U,
  authUser: AuthContextUser,
  briefData: Record<string, any>,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const userRef = db.collection('users').doc(authUser.uid);
  const docRef = db.doc(path).withConverter(converter<U>(db));

  await docRef.create({
    id: path.split('/').slice(-1)[0],
    path,
    ...data,
    ...briefData,
    ...createMetadata(userRef),
  });

  return docRef.get();
};

export const createSeries = async (
  organizationPath: DocPath,
  series: Pick<
    Event,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const orgRef = db.doc(organizationPath);
  const orgDoc = await orgRef.withConverter(converter<Organization>(db)).get();
  const orgData = orgDoc.data();
  if (!orgData) {
    throw new Error('Organization not found');
  }

  const organizationBrief: OrganizationBrief = {
    id: orgRef.id,
    path: asDocPath(orgRef.path),
    name: orgData.name,
  };

  const seriesRef = orgRef.collection('series').doc();

  return createDocument(asDocPath(seriesRef.path), series, authUser, {
    organizationBrief,
  });
};

export const createEvent = async (
  seriesPath: DocPath,
  event: Pick<
    Event,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const seriesRef = db.doc(seriesPath);
  const seriesDoc = await seriesRef.withConverter(converter<Series>(db)).get();
  const seriesData = seriesDoc.data();
  if (!seriesData) {
    throw new Error('Series not found');
  }

  const seriesBrief: SeriesBrief = {
    id: seriesRef.id,
    path: asDocPath(seriesRef.path),
    name: seriesData.name,
    startDate: seriesData.startDate,
    endDate: seriesData.endDate,
    organizationBrief: seriesData.organizationBrief,
  };

  const eventRef = seriesRef.collection('events').doc();

  return createDocument(asDocPath(eventRef.path), event, authUser, {
    seriesBrief,
  });
};

export const createRace = async (
  eventPath: DocPath,
  race: Pick<
    Event,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const eventRef = db.doc(eventPath);
  const eventDoc = await eventRef.withConverter(converter<Event>(db)).get();
  const eventData = eventDoc.data();
  if (!eventData) {
    throw new Error('Event not found');
  }

  const eventBrief: EventBrief = {
    id: eventRef.id,
    path: asDocPath(eventRef.path),
    name: eventData.name,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    seriesBrief: eventData.seriesBrief,
  };

  const raceRef = eventRef.collection('races').doc();

  return createDocument(asDocPath(raceRef.path), race, authUser, {
    eventBrief,
  });
};

export const createPreem = async (
  racePath: DocPath,
  preem: Pick<
    Preem,
    | 'name'
    | 'description'
    | 'type'
    | 'status'
    | 'prizePool'
    | 'timeLimit'
    | 'minimumThreshold'
  >,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const raceRef = db.doc(racePath);
  const raceDoc = await raceRef.withConverter(converter<Race>(db)).get();
  const raceData = raceDoc.data();
  if (!raceData) {
    throw new Error('Race not found');
  }

  const raceBrief: RaceBrief = {
    id: raceRef.id,
    path: asDocPath(raceRef.path),
    name: raceData.name,
    startDate: raceData.startDate,
    endDate: raceData.endDate,
    eventBrief: raceData.eventBrief,
  };

  const preemRef = raceRef.collection('preems').doc();

  return createDocument(asDocPath(preemRef.path), preem, authUser, {
    raceBrief,
  });
};

export const createOrganization = async (
  organization: Pick<Organization, 'name' | 'description' | 'website'>,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const orgRef = db.collection('organizations').doc();

  return createDocument(asDocPath(orgRef.path), organization, authUser, {});
};

export const createUser = async (
  user: Pick<
    User,
    'name' | 'email' | 'avatarUrl' | 'affiliation' | 'raceLicenseId' | 'address'
  >,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const userRef = db.collection('users').doc(authUser.uid);

  return createDocument(asDocPath(userRef.path), user, authUser, {});
};

export const createPendingContribution = async (
  preemPath: DocPath,
  {
    amount,
    message,
    isAnonymous,
  }: { amount: number; message: string; isAnonymous: boolean },
  authUser: AuthContextUser,
) => {
  if (!authUser.uid) {
    unauthorized();
  }

  const db = await getFirestore();
  const preemRef = db.doc(preemPath);
  const contributionsRef = preemRef.collection('contributions');
  const userRef = db.collection('users').doc(authUser.uid);

  const docRef = await contributionsRef.add({
    amount,
    message,
    status: 'pending',
    contributor: isAnonymous ? null : userRef,
    ...createMetadata(userRef),
  });

  await docRef.update({ path: docRef.path });
};
