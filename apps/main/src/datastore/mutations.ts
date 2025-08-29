'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { FieldValue, type Transaction } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { getTimestampFromISODate } from '../firebase-admin/dates';
import { isUserAuthorized } from './access';
import type {
  Event,
  EventBrief,
  Organization,
  OrganizationBrief,
  Preem,
  PreemBrief,
  Race,
  RaceBrief,
  Series,
  SeriesBrief,
  User,
} from './types';

export const updateUser = async (
  path: string,
  user: Partial<User>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const docRef = db.doc(path);
  await docRef.update({
    ...user,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': docRef,
  });
};

export const updateOrganization = async (
  path: string,
  organization: Partial<Organization>,
  authUser: AuthContextUser,
) => {
  const orgId = path.split('/').pop();
  if (!orgId) {
    throw new Error('Invalid path');
  }
  return await updateOrganizationAndDescendants(authUser, orgId, organization);
};

export const updateSeries = async (
  path: string,
  series: Partial<Omit<Series, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const seriesId = path.split('/').pop();
  if (!seriesId) {
    throw new Error('Invalid path');
  }
  const data = {
    ...series,
    startDate: getTimestampFromISODate(series.startDate),
    endDate: getTimestampFromISODate(series.endDate),
  };
  return await updateSeriesAndDescendants(authUser, seriesId, data);
};

export const updateEvent = async (
  path: string,
  event: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const eventId = path.split('/').pop();
  if (!eventId) {
    throw new Error('Invalid path');
  }
  const data = {
    ...event,
    startDate: getTimestampFromISODate(event.startDate),
    endDate: getTimestampFromISODate(event.endDate),
  };
  return await updateEventAndDescendants(authUser, eventId, data);
};

export const updateOrganizationStripeConnectAccount = async (
  organizationId: string,
  account: Stripe.Account,
  authUser: AuthContextUser,
) => {
  const path = `organizations/${organizationId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });
};

export const updateOrganizationStripeConnectAccountForWebhook = async (
  organizationId: string,
  account: Stripe.Account,
) => {
  const db = await getFirestore();
  const orgRef = db.doc(`organizations/${organizationId}`);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metadata.lastModified': FieldValue.serverTimestamp(),
  });
};

export const createPendingContribution = async (
  preemPath: string,
  {
    amount,
    message,
    isAnonymous,
  }: { amount: number; message: string; isAnonymous: boolean },
  authUser: AuthContextUser,
) => {
  if (!authUser.uid) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const preemRef = db.doc(preemPath);
  const contributionsRef = preemRef.collection('contributions');
  const userRef = db.collection('users').doc(authUser.uid);

  await contributionsRef.add({
    amount,
    message,
    status: 'pending',
    contributor: isAnonymous ? null : userRef,
    'metadata.created': FieldValue.serverTimestamp(),
    'metadata.createdBy': userRef,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });
};

const updatePreemDescendants = async (
  transaction: Transaction,
  preemId: string,
  preemBrief: PreemBrief,
): Promise<number> => {
  const db = await getFirestore();
  const contributionSnap = await db
    .collectionGroup('contributions')
    .where('preemBrief.id', '==', preemId)
    .get();
  contributionSnap.docs.forEach((doc) => {
    transaction.update(doc.ref, { preemBrief });
  });
  return contributionSnap.size;
};

const updateRaceDescendants = async (
  transaction: Transaction,
  raceId: string,
  raceBrief: RaceBrief,
): Promise<number> => {
  const db = await getFirestore();
  let count = 0;

  // Update preems
  const preemSnap = await db
    .collectionGroup('preems')
    .where('raceBrief.id', '==', raceId)
    .get();
  for (const doc of preemSnap.docs) {
    transaction.update(doc.ref, { raceBrief });
    count++;
    const preemData = doc.data();
    const newPreemBrief: PreemBrief = {
      id: doc.id,
      name: preemData.name,
      raceBrief,
    };
    count += await updatePreemDescendants(transaction, doc.id, newPreemBrief);
  }
  return count;
};

const updateEventDescendants = async (
  transaction: Transaction,
  eventId: string,
  eventBrief: EventBrief,
): Promise<number> => {
  const db = await getFirestore();
  let count = 0;
  const raceSnap = await db
    .collectionGroup('races')
    .where('eventBrief.id', '==', eventId)
    .get();
  for (const doc of raceSnap.docs) {
    transaction.update(doc.ref, { eventBrief });
    count++;
    const raceData = doc.data();
    const newRaceBrief: RaceBrief = {
      id: doc.id,
      name: raceData.name,
      startDate: raceData.startDate,
      endDate: raceData.endDate,
      eventBrief,
    };
    count += await updateRaceDescendants(transaction, doc.id, newRaceBrief);
  }
  return count;
};

const updateSeriesDescendants = async (
  transaction: Transaction,
  seriesId: string,
  seriesBrief: SeriesBrief,
): Promise<number> => {
  const db = await getFirestore();
  let count = 0;
  const eventSnap = await db
    .collectionGroup('events')
    .where('seriesBrief.id', '==', seriesId)
    .get();
  for (const doc of eventSnap.docs) {
    transaction.update(doc.ref, { seriesBrief });
    count++;
    const eventData = doc.data();
    const newEventBrief: EventBrief = {
      id: doc.id,
      name: eventData.name,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      seriesBrief,
    };
    count += await updateEventDescendants(transaction, doc.id, newEventBrief);
  }
  return count;
};

const updateOrganizationDescendants = async (
  transaction: Transaction,
  orgId: string,
  organizationBrief: OrganizationBrief,
): Promise<number> => {
  const db = await getFirestore();
  let count = 0;
  const seriesSnap = await db
    .collectionGroup('series')
    .where('organizationBrief.id', '==', orgId)
    .get();
  for (const doc of seriesSnap.docs) {
    transaction.update(doc.ref, { organizationBrief });
    count++;
    const seriesData = doc.data();
    const newSeriesBrief: SeriesBrief = {
      id: doc.id,
      name: seriesData.name,
      startDate: seriesData.startDate,
      endDate: seriesData.endDate,
      organizationBrief,
    };
    count += await updateSeriesDescendants(transaction, doc.id, newSeriesBrief);
  }
  return count;
};

export const updatePreemAndDescendants = async (
  authUser: AuthContextUser,
  preemId: string,
  data: Partial<Preem>,
) => {
  const path = `preems/${preemId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const preemRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const preemDoc = await transaction.get(preemRef);
    const newPreem = { ...preemDoc.data(), ...data };
    transaction.update(preemRef, data);
    const preemBrief: PreemBrief = {
      id: preemId,
      name: newPreem.name,
      raceBrief: newPreem.raceBrief,
    };
    return await updatePreemDescendants(transaction, preemId, preemBrief);
  });
};

export const updateRaceAndDescendants = async (
  authUser: AuthContextUser,
  raceId: string,
  data: Partial<Race>,
) => {
  const path = `races/${raceId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const raceRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const raceDoc = await transaction.get(raceRef);
    const newRace = { ...raceDoc.data(), ...data };
    transaction.update(raceRef, data);
    const raceBrief: RaceBrief = {
      id: raceId,
      name: newRace.name,
      startDate: newRace.startDate,
      endDate: newRace.endDate,
      eventBrief: newRace.eventBrief,
    };
    return await updateRaceDescendants(transaction, raceId, raceBrief);
  });
};

export const updateEventAndDescendants = async (
  authUser: AuthContextUser,
  eventId: string,
  data: Partial<Event>,
) => {
  const path = `events/${eventId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const eventRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const newEvent = { ...eventDoc.data(), ...data };
    transaction.update(eventRef, data);
    const eventBrief: EventBrief = {
      id: eventId,
      name: newEvent.name,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      seriesBrief: newEvent.seriesBrief,
    };
    return await updateEventDescendants(transaction, eventId, eventBrief);
  });
};

export const updateSeriesAndDescendants = async (
  authUser: AuthContextUser,
  seriesId: string,
  data: Partial<Series>,
) => {
  const path = `series/${seriesId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const seriesRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const seriesDoc = await transaction.get(seriesRef);
    const newSeries = { ...seriesDoc.data(), ...data };
    transaction.update(seriesRef, data);
    const seriesBrief: SeriesBrief = {
      id: seriesId,
      name: newSeries.name,
      startDate: newSeries.startDate,
      endDate: newSeries.endDate,
      organizationBrief: newSeries.organizationBrief,
    };
    return await updateSeriesDescendants(transaction, seriesId, seriesBrief);
  });
};

export const updateOrganizationAndDescendants = async (
  authUser: AuthContextUser,
  orgId: string,
  data: Partial<Organization>,
) => {
  const path = `organizations/${orgId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    throw new Error('Unauthorized');
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const orgDoc = await transaction.get(orgRef);
    const newOrg = { ...orgDoc.data(), ...data };
    transaction.update(orgRef, data);
    const organizationBrief: OrganizationBrief = {
      id: orgId,
      name: newOrg.name,
    };
    return await updateOrganizationDescendants(
      transaction,
      orgId,
      organizationBrief,
    );
  });
};
