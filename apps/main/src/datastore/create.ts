'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
} from 'firebase-admin/firestore';
import { getTimestampFromISODate } from '../firebase-admin/dates';
import { isUserAuthorized } from './access';
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
} from './types';

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
  const docRef = db.doc(path);

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
  series: Partial<Omit<Series, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const orgRef = db.doc(organizationPath);
  const orgDoc = await orgRef.get();
  const orgData = orgDoc.data() as Organization;

  const organizationBrief: OrganizationBrief = {
    id: orgRef.id,
    path: asDocPath(orgRef.path),
    name: orgData.name,
  };

  const seriesRef = orgRef.collection('series').doc();

  return createDocument(
    asDocPath(seriesRef.path),
    {
      ...series,
      startDate: getTimestampFromISODate(series.startDate),
      endDate: getTimestampFromISODate(series.endDate),
    },
    authUser,
    { organizationBrief },
  );
};

export const createEvent = async (
  seriesPath: DocPath,
  event: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const seriesRef = db.doc(seriesPath);
  const seriesDoc = await seriesRef.get();
  const seriesData = seriesDoc.data() as Series;

  const seriesBrief: SeriesBrief = {
    id: seriesRef.id,
    path: asDocPath(seriesRef.path),
    name: seriesData.name,
    startDate: seriesData.startDate,
    endDate: seriesData.endDate,
    organizationBrief: seriesData.organizationBrief,
  };

  const eventRef = seriesRef.collection('events').doc();

  return createDocument(
    asDocPath(eventRef.path),
    {
      ...event,
      startDate: getTimestampFromISODate(event.startDate),
      endDate: getTimestampFromISODate(event.endDate),
    },
    authUser,
    { seriesBrief },
  );
};

export const createRace = async (
  eventPath: DocPath,
  race: Partial<Omit<Race, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const eventRef = db.doc(eventPath);
  const eventDoc = await eventRef.get();
  const eventData = eventDoc.data() as Event;

  const eventBrief: EventBrief = {
    id: eventRef.id,
    path: asDocPath(eventRef.path),
    name: eventData.name,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    seriesBrief: eventData.seriesBrief,
  };

  const raceRef = eventRef.collection('races').doc();

  return createDocument(
    asDocPath(raceRef.path),
    {
      ...race,
      startDate: getTimestampFromISODate(race.startDate),
      endDate: getTimestampFromISODate(race.endDate),
    },
    authUser,
    { eventBrief },
  );
};

export const createPreem = async (
  racePath: DocPath,
  preem: Partial<Preem>,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const raceRef = db.doc(racePath);
  const raceDoc = await raceRef.get();
  const raceData = raceDoc.data() as Race;

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
  organization: Partial<Organization>,
  authUser: AuthContextUser,
) => {
  const db = await getFirestore();
  const orgRef = db.collection('organizations').doc();

  return createDocument(asDocPath(orgRef.path), organization, authUser, {});
};

export const createUser = async (
  user: Partial<User>,
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
    'metadata.created': FieldValue.serverTimestamp(),
    'metadata.createdBy': userRef,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });

  await docRef.update({ path: docRef.path });
};
