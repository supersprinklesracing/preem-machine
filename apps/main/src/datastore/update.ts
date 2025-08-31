'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
  type Transaction,
} from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { getTimestampFromISODate } from '../firebase-admin/dates';
import { isUserAuthorized } from './access';
import { unauthorized } from './errors';
import {
  eventConverter,
  preemConverter,
  raceConverter,
  seriesConverter,
} from './converters';
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

const getUpdateMetadata = (userRef: DocumentReference<DocumentData>) => ({
  'metadata.lastModified': FieldValue.serverTimestamp(),
  'metadata.lastModifiedBy': userRef,
});

export const updateUser = async (
  path: string,
  user: Partial<User>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const docRef = db.doc(path);
  await docRef.update({
    ...user,
    ...getUpdateMetadata(docRef),
  });
};

export const updateOrganization = async (
  path: string,
  organization: Partial<Organization>,
  authUser: AuthContextUser,
) => {
  return await updateOrganizationAndDescendants(
    authUser,
    path,
    organization,
  );
};

export const updateSeries = async (
  path: string,
  series: Partial<Omit<Series, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const data = {
    ...series,
    startDate: getTimestampFromISODate(series.startDate),
    endDate: getTimestampFromISODate(series.endDate),
  };
  return await updateSeriesAndDescendants(authUser, path, data);
};

export const updateRace = async (
  path: string,
  race: Partial<Omit<Race, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const data = {
    ...race,
    startDate: getTimestampFromISODate(race.startDate),
    endDate: getTimestampFromISODate(race.endDate),
  };
  return await updateRaceAndDescendants(authUser, path, data);
};

export const updateEvent = async (
  path: string,
  event: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  const data = {
    ...event,
    startDate: getTimestampFromISODate(event.startDate),
    endDate: getTimestampFromISODate(event.endDate),
  };
  return await updateEventAndDescendants(authUser, path, data);
};

export const updateOrganizationStripeConnectAccount = async (
  organizationId: string,
  account: Stripe.Account,
  authUser: AuthContextUser,
) => {
  const path = `organizations/${organizationId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);
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
  const db = await getFirestore();
  const orgRef = db.doc(`organizations/${organizationId}`);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metadata.lastModified': FieldValue.serverTimestamp(),
  });
};

interface DocUpdate {
  ref: DocumentReference;
  data: DocumentData;
}

const preparePreemDescendantUpdates = async (
  transaction: Transaction,
  preemId: string,
  preemBrief: PreemBrief,
): Promise<DocUpdate[]> => {
  const db = await getFirestore();
  const updates: DocUpdate[] = [];
  const contributionSnap = await transaction.get(
    db.collectionGroup('contributions').where('preemBrief.id', '==', preemId),
  );
  contributionSnap.docs.forEach((doc) => {
    updates.push({ ref: doc.ref, data: { preemBrief } });
  });
  return updates;
};

const prepareRaceDescendantUpdates = async (
  transaction: Transaction,
  raceId: string,
  raceBrief: RaceBrief,
): Promise<DocUpdate[]> => {
  const db = await getFirestore();
  let updates: DocUpdate[] = [];

  const preemSnap = await transaction.get(
    db
      .collectionGroup('preems')
      .select('name')
      .where('raceBrief.id', '==', raceId)
      .withConverter(preemConverter),
  );

  for (const doc of preemSnap.docs) {
    updates.push({ ref: doc.ref, data: { raceBrief } });
    const newPreemBrief: PreemBrief = {
      id: doc.id,
      name: doc.data().name,
      raceBrief,
    };
    const descendantUpdates = await preparePreemDescendantUpdates(
      transaction,
      doc.id,
      newPreemBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

const prepareEventDescendantUpdates = async (
  transaction: Transaction,
  eventId: string,
  eventBrief: EventBrief,
): Promise<DocUpdate[]> => {
  const db = await getFirestore();
  let updates: DocUpdate[] = [];
  const raceSnap = await transaction.get(
    db
      .collectionGroup('races')
      .select('name', 'startDate', 'endDate')
      .where('eventBrief.id', '==', eventId)
      .withConverter(raceConverter),
  );

  for (const doc of raceSnap.docs) {
    updates.push({ ref: doc.ref, data: { eventBrief } });
    const newRaceBrief: RaceBrief = {
      id: doc.id,
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      eventBrief,
    };
    const descendantUpdates = await prepareRaceDescendantUpdates(
      transaction,
      doc.id,
      newRaceBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

const prepareSeriesDescendantUpdates = async (
  transaction: Transaction,
  seriesId: string,
  seriesBrief: SeriesBrief,
): Promise<DocUpdate[]> => {
  const db = await getFirestore();
  let updates: DocUpdate[] = [];
  const eventSnap = await transaction.get(
    db
      .collectionGroup('events')
      .select('name', 'startDate', 'endDate')
      .where('seriesBrief.id', '==', seriesId)
      .withConverter(eventConverter),
  );

  for (const doc of eventSnap.docs) {
    updates.push({ ref: doc.ref, data: { seriesBrief } });
    const newEventBrief: EventBrief = {
      id: doc.id,
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      seriesBrief,
    };
    const descendantUpdates = await prepareEventDescendantUpdates(
      transaction,
      doc.id,
      newEventBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

const prepareOrganizationDescendantUpdates = async (
  transaction: Transaction,
  orgId: string,
  organizationBrief: OrganizationBrief,
): Promise<DocUpdate[]> => {
  const db = await getFirestore();
  let updates: DocUpdate[] = [];
  const seriesSnap = await transaction.get(
    db
      .collectionGroup('series')
      .select('name', 'startDate', 'endDate')
      .where('organizationBrief.id', '==', orgId)
      .withConverter(seriesConverter),
  );

  for (const doc of seriesSnap.docs) {
    updates.push({ ref: doc.ref, data: { organizationBrief } });
    const newSeriesBrief: SeriesBrief = {
      id: doc.id,
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      organizationBrief,
    };
    const descendantUpdates = await prepareSeriesDescendantUpdates(
      transaction,
      doc.id,
      newSeriesBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

export const updatePreemAndDescendants = async (
  authUser: AuthContextUser,
  preemId: string,
  data: Partial<Preem>,
) => {
  const path = `preems/${preemId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const preemRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const preemDoc = await transaction.get(preemRef);
    const newPreem = { ...preemDoc.data(), ...data };
    const preemBrief: PreemBrief = {
      id: preemId,
      name: newPreem.name,
      raceBrief: newPreem.raceBrief,
    };
    const descendantUpdates = await preparePreemDescendantUpdates(
      transaction,
      preemId,
      preemBrief,
    );

    transaction.update(preemRef, data);
    for (const { ref, data } of descendantUpdates) {
      transaction.update(ref, data);
    }

    return [newPreem, ...descendantUpdates.map((u) => u.data)];
  });
};

export const updateRaceAndDescendants = async (
  authUser: AuthContextUser,
  path: string,
  data: Partial<Race>,
) => {
  const raceId = path.split('/').pop();
  if (!raceId) {
    throw new Error('Invalid path');
  }

  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const raceRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const raceDoc = await transaction.get(raceRef);
    const newRace = { ...raceDoc.data(), ...data };
    const raceBrief: RaceBrief = {
      id: raceId,
      name: newRace.name,
      startDate: newRace.startDate,
      endDate: newRace.endDate,
      eventBrief: newRace.eventBrief,
    };
    const descendantUpdates = await prepareRaceDescendantUpdates(
      transaction,
      raceId,
      raceBrief,
    );

    transaction.update(raceRef, data);
    for (const { ref, data } of descendantUpdates) {
      transaction.update(ref, data);
    }

    return [newRace, ...descendantUpdates.map((u) => u.data)];
  });
};

export const updateEventAndDescendants = async (
  authUser: AuthContextUser,
  path: string,
  data: Partial<Event>,
) => {
  const eventId = path.split('/').pop();
  if (!eventId) {
    throw new Error('Invalid path');
  }

  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const eventRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const newEvent = { ...eventDoc.data(), ...data };
    const eventBrief: EventBrief = {
      id: eventId,
      name: newEvent.name,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      seriesBrief: newEvent.seriesBrief,
    };
    const descendantUpdates = await prepareEventDescendantUpdates(
      transaction,
      eventId,
      eventBrief,
    );

    transaction.update(eventRef, data);
    for (const { ref, data } of descendantUpdates) {
      transaction.update(ref, data);
    }

    return [newEvent, ...descendantUpdates.map((u) => u.data)];
  });
};

export const updateSeriesAndDescendants = async (
  authUser: AuthContextUser,
  path: string,
  data: Partial<Series>,
) => {
  const seriesId = path.split('/').pop();
  if (!seriesId) {
    throw new Error('Invalid path');
  }

  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const seriesRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const seriesDoc = await transaction.get(seriesRef);
    const newSeries = { ...seriesDoc.data(), ...data };
    const seriesBrief: SeriesBrief = {
      id: seriesId,
      name: newSeries.name,
      startDate: newSeries.startDate,
      endDate: newSeries.endDate,
      organizationBrief: newSeries.organizationBrief,
    };
    const descendantUpdates = await prepareSeriesDescendantUpdates(
      transaction,
      seriesId,
      seriesBrief,
    );

    transaction.update(seriesRef, data);
    for (const { ref, data } of descendantUpdates) {
      transaction.update(ref, data);
    }

    return [newSeries, ...descendantUpdates.map((u) => u.data)];
  });
};

export const updateOrganizationAndDescendants = async (
  authUser: AuthContextUser,
  path: string,
  data: Partial<Organization>,
) => {
  const orgId = path.split('/').pop();
  if (!orgId) {
    throw new Error('Invalid path');
  }

  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);

  return await db.runTransaction(async (transaction) => {
    const orgDoc = await transaction.get(orgRef);
    const newOrg = { ...orgDoc.data(), ...data };
    const organizationBrief: OrganizationBrief = {
      id: orgId,
      name: newOrg.name,
    };
    const descendantUpdates = await prepareOrganizationDescendantUpdates(
      transaction,
      orgId,
      organizationBrief,
    );

    transaction.update(orgRef, data);
    for (const { ref, data } of descendantUpdates) {
      transaction.update(ref, data);
    }

    return [newOrg, ...descendantUpdates.map((u) => u.data)];
  });
};
