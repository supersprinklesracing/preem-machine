'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { FieldValue, Firestore, Transaction } from 'firebase-admin/firestore';
import { unauthorized } from 'next/navigation';
import Stripe from 'stripe';
import { getTimestampFromISODate } from '../firebase-admin/dates';
import { isUserAuthorized } from './access';
import { briefs } from './paths';
import type {
  Contribution,
  Event,
  Organization,
  Preem,
  Race,
  Series,
  User,
} from './types';

// TODO: Move this to a shared location.
const updateDoc = (
  userRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  doc: any,
) => ({
  ...doc,
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
  const userRef = db.collection('users').doc(authUser.uid);
  await docRef.update(updateDoc(userRef, user));
};

export const updateOrganization = async (
  path: string,
  organization: Partial<Organization>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await orgRef.update(updateDoc(userRef, organization));
};

export const updateSeries = async (
  path: string,
  series: Partial<Omit<Series, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const seriesRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);

  return db.runTransaction(async (transaction) => {
    // Read phase
    const seriesDoc = await transaction.get(seriesRef);
    if (!seriesDoc.exists) {
      throw new Error(`Series with path ${path} does not exist.`);
    }

    const eventsQuery = db
      .collection('events')
      .where('seriesBrief.id', '==', seriesRef.id);
    const eventsSnapshot = await transaction.get(eventsQuery);
    const eventDocs = eventsSnapshot.docs;

    const raceDocsByEvent: { [key: string]: any[] } = {};
    for (const eventDoc of eventDocs) {
      const racesQuery = db
        .collection('races')
        .where('eventBrief.id', '==', eventDoc.id);
      const racesSnapshot = await transaction.get(racesQuery);
      raceDocsByEvent[eventDoc.id] = racesSnapshot.docs;
    }

    const preemDocsByRace: { [key: string]: any[] } = {};
    for (const eventId in raceDocsByEvent) {
      for (const raceDoc of raceDocsByEvent[eventId]) {
        const preemsQuery = db
          .collection('preems')
          .where('raceBrief.id', '==', raceDoc.id);
        const preemsSnapshot = await transaction.get(preemsQuery);
        preemDocsByRace[raceDoc.id] = preemsSnapshot.docs;
      }
    }

    const contributionDocsByPreem: { [key: string]: any[] } = {};
    for (const raceId in preemDocsByRace) {
      for (const preemDoc of preemDocsByRace[raceId]) {
        const contributionsQuery = db
          .collection('contributions')
          .where('preemBrief.id', '==', preemDoc.id);
        const contributionsSnapshot = await transaction.get(contributionsQuery);
        contributionDocsByPreem[preemDoc.id] = contributionsSnapshot.docs;
      }
    }

    // Write phase
    const updatedSeriesData = {
      ...seriesDoc.data(),
      ...series,
      startDate: getTimestampFromISODate(series.startDate),
      endDate: getTimestampFromISODate(series.endDate),
    } as Series;
    transaction.update(seriesRef, updateDoc(userRef, updatedSeriesData));

    const seriesBrief = briefs.series(updatedSeriesData);
    for (const eventDoc of eventDocs) {
      const updatedEventData = { ...eventDoc.data(), seriesBrief } as Event;
      transaction.update(eventDoc.ref, { seriesBrief });
      const eventBrief = briefs.event(updatedEventData);
      for (const raceDoc of raceDocsByEvent[eventDoc.id]) {
        const updatedRaceData = { ...raceDoc.data(), eventBrief } as Race;
        transaction.update(raceDoc.ref, { eventBrief });
        const raceBrief = briefs.race(updatedRaceData);
        for (const preemDoc of preemDocsByRace[raceDoc.id]) {
          const updatedPreemData = { ...preemDoc.data(), raceBrief } as Preem;
          transaction.update(preemDoc.ref, { raceBrief });
          const preemBrief = briefs.preem(updatedPreemData);
          for (const contributionDoc of contributionDocsByPreem[preemDoc.id]) {
            transaction.update(contributionDoc.ref, { preemBrief });
          }
        }
      }
    }
  });
};

export const updateEvent = async (
  path: string,
  event: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const eventRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);

  return db.runTransaction(async (transaction) => {
    // Read phase
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
      throw new Error(`Event with path ${path} does not exist.`);
    }

    const racesQuery = db
      .collection('races')
      .where('eventBrief.id', '==', eventRef.id);
    const racesSnapshot = await transaction.get(racesQuery);
    const raceDocs = racesSnapshot.docs;

    const preemDocsByRace: { [key: string]: any[] } = {};
    for (const raceDoc of raceDocs) {
      const preemsQuery = db
        .collection('preems')
        .where('raceBrief.id', '==', raceDoc.id);
      const preemsSnapshot = await transaction.get(preemsQuery);
      preemDocsByRace[raceDoc.id] = preemsSnapshot.docs;
    }

    const contributionDocsByPreem: { [key: string]: any[] } = {};
    for (const raceId in preemDocsByRace) {
      for (const preemDoc of preemDocsByRace[raceId]) {
        const contributionsQuery = db
          .collection('contributions')
          .where('preemBrief.id', '==', preemDoc.id);
        const contributionsSnapshot = await transaction.get(contributionsQuery);
        contributionDocsByPreem[preemDoc.id] = contributionsSnapshot.docs;
      }
    }

    // Write phase
    const updatedEventData = {
      ...eventDoc.data(),
      ...event,
      startDate: getTimestampFromISODate(event.startDate),
      endDate: getTimestampFromISODate(event.endDate),
    } as Event;
    transaction.update(eventRef, updateDoc(userRef, updatedEventData));

    const eventBrief = briefs.event(updatedEventData);
    for (const raceDoc of raceDocs) {
      const updatedRaceData = { ...raceDoc.data(), eventBrief } as Race;
      transaction.update(raceDoc.ref, { eventBrief });
      const raceBrief = briefs.race(updatedRaceData);
      for (const preemDoc of preemDocsByRace[raceDoc.id]) {
        const updatedPreemData = { ...preemDoc.data(), raceBrief } as Preem;
        transaction.update(preemDoc.ref, { raceBrief });
        const preemBrief = briefs.preem(updatedPreemData);
        for (const contributionDoc of contributionDocsByPreem[preemDoc.id]) {
          transaction.update(contributionDoc.ref, { preemBrief });
        }
      }
    }
  });
};

export const updateRace = async (
  path: string,
  race: Partial<Omit<Race, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const raceRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);

  return db.runTransaction(async (transaction) => {
    // Read phase
    const raceDoc = await transaction.get(raceRef);
    if (!raceDoc.exists) {
      throw new Error(`Race with path ${path} does not exist.`);
    }

    const preemsQuery = db
      .collection('preems')
      .where('raceBrief.id', '==', raceRef.id);
    const preemsSnapshot = await transaction.get(preemsQuery);
    const preemDocs = preemsSnapshot.docs;

    const contributionDocsByPreem: { [key: string]: any[] } = {};
    for (const preemDoc of preemDocs) {
      const contributionsQuery = db
        .collection('contributions')
        .where('preemBrief.id', '==', preemDoc.id);
      const contributionsSnapshot = await transaction.get(contributionsQuery);
      contributionDocsByPreem[preemDoc.id] = contributionsSnapshot.docs;
    }

    // Write phase
    const updatedRaceData = {
      ...raceDoc.data(),
      ...race,
      startDate: getTimestampFromISODate(race.startDate),
      endDate: getTimestampFromISODate(race.endDate),
    } as Race;
    transaction.update(raceRef, updateDoc(userRef, updatedRaceData));

    const raceBrief = briefs.race(updatedRaceData);
    for (const preemDoc of preemDocs) {
      const updatedPreemData = { ...preemDoc.data(), raceBrief } as Preem;
      transaction.update(preemDoc.ref, { raceBrief });
      const preemBrief = briefs.preem(updatedPreemData);
      for (const contributionDoc of contributionDocsByPreem[preemDoc.id]) {
        transaction.update(contributionDoc.ref, { preemBrief });
      }
    }
  });
};

export const updatePreem = async (
  path: string,
  preem: Partial<Preem>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const preemRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);

  return db.runTransaction(async (transaction) => {
    // Read phase
    const preemDoc = await transaction.get(preemRef);
    if (!preemDoc.exists) {
      throw new Error(`Preem with path ${path} does not exist.`);
    }

    const contributionsQuery = db
      .collection('contributions')
      .where('preemBrief.id', '==', preemRef.id);
    const contributionsSnapshot = await transaction.get(contributionsQuery);
    const contributionDocs = contributionsSnapshot.docs;

    // Write phase
    const updatedPreemData = { ...preemDoc.data(), ...preem } as Preem;
    transaction.update(preemRef, updateDoc(userRef, updatedPreemData));

    const preemBrief = briefs.preem(updatedPreemData);
    for (const contributionDoc of contributionDocs) {
      transaction.update(contributionDoc.ref, { preemBrief });
    }
  });
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
    unauthorized();
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
