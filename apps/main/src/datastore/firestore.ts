import 'server-only';

import { getFirestore } from '@/firebase-admin';
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { cache } from 'react';
import {
  Contribution as FirestoreContribution,
  Event as FirestoreEvent,
  Organization as FirestoreOrganization,
  Preem as FirestorePreem,
  Race as FirestoreRace,
  RaceSeries as FirestoreRaceSeries,
  User as FirestoreUser,
} from './firestore-types';

// --- Helper Functions ---

const docWithId = <T>(doc: DocumentSnapshot | QueryDocumentSnapshot): T => {
  return { id: doc.id, ...doc.data() } as T;
};

async function getDocById<T>(
  collection: string,
  id: string
): Promise<T | undefined> {
  const db = await getFirestore();
  const docSnap = await db.collection(collection).doc(id).get();
  if (!docSnap.exists) return undefined;
  return docWithId<T>(docSnap);
}

// --- Augmented Firestore Types (for returning sub-collections) ---

export type RaceWithPreems = FirestoreRace & {
  preems: PreemWithContributions[];
};
export type EventWithRaces = FirestoreEvent & { races: RaceWithPreems[] };
export type SeriesWithEvents = FirestoreRaceSeries & {
  events: EventWithRaces[];
};
export type PreemWithContributions = FirestorePreem & {
  contributionHistory: FirestoreContribution[];
};

// --- Fetch Functions for Sub-collections ---

async function fetchContributionsForPreem(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<PreemWithContributions> {
  const preem = docWithId<FirestorePreem>(doc);
  const contributionsSnap = await doc.ref.collection('contributions').get();
  const contributionHistory = contributionsSnap.docs.map((doc) =>
    docWithId<FirestoreContribution>(doc)
  );
  return { ...preem, contributionHistory };
}

async function fetchPreemsForRace(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<RaceWithPreems> {
  const race = docWithId<FirestoreRace>(doc);
  const preemsSnap = await doc.ref.collection('preems').get();
  const preems = await Promise.all(
    preemsSnap.docs.map(fetchContributionsForPreem)
  );
  return { ...race, preems };
}

async function fetchRacesForEvent(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<EventWithRaces> {
  const event = docWithId<FirestoreEvent>(doc);
  const racesSnap = await doc.ref.collection('races').get();
  const races = await Promise.all(racesSnap.docs.map(fetchPreemsForRace));
  return { ...event, races };
}

async function fetchEventsForSeries(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<SeriesWithEvents> {
  const series = docWithId<FirestoreRaceSeries>(doc);
  const eventsSnap = await doc.ref.collection('events').get();
  const events = await Promise.all(eventsSnap.docs.map(fetchRacesForEvent));
  return { ...series, events };
}

// --- Exported Data Access Functions ---

export const getUsers = cache(async (): Promise<FirestoreUser[]> => {
  const db = await getFirestore();
  const usersSnap = await db.collection('users').get();
  return usersSnap.docs.map((doc) => docWithId<FirestoreUser>(doc));
});

export const getUserById = cache(
  async (id: string | undefined): Promise<FirestoreUser | undefined> => {
    if (!id) return undefined;
    return getDocById<FirestoreUser>('users', id);
  }
);

export const getUsersByIds = cache(
  async (ids: string[]): Promise<FirestoreUser[]> => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return [];
    const db = await getFirestore();
    const usersSnap = await db
      .collection('users')
      .where('id', 'in', uniqueIds)
      .get();
    return usersSnap.docs.map((doc) => docWithId<FirestoreUser>(doc));
  }
);

export const getOrganizations = cache(
  async (): Promise<FirestoreOrganization[]> => {
    const db = await getFirestore();
    const orgsSnap = await db.collection('organizations').get();
    return orgsSnap.docs.map((doc) => docWithId<FirestoreOrganization>(doc));
  }
);

export const getOrganizationById = cache(
  async (id: string): Promise<FirestoreOrganization | undefined> => {
    return getDocById<FirestoreOrganization>('organizations', id);
  }
);

export const getRaceById = cache(
  async (id: string): Promise<RaceWithPreems | undefined> => {
    const db = await getFirestore();
    const raceSnap = await db
      .collectionGroup('races')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (raceSnap.empty) return undefined;
    return fetchPreemsForRace(raceSnap.docs[0]);
  }
);

export const getPreemAndRaceById = cache(
  async (
    id: string
  ): Promise<
    { preem: PreemWithContributions; race: RaceWithPreems } | undefined
  > => {
    const db = await getFirestore();
    const preemSnap = await db
      .collectionGroup('preems')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (preemSnap.empty) return undefined;

    const preemDoc = preemSnap.docs[0];
    const raceRef = preemDoc.ref.parent.parent;
    if (!raceRef) return undefined;

    const raceDoc = await raceRef.get();
    if (!raceDoc.exists) return undefined;

    const race = await fetchPreemsForRace(raceDoc as QueryDocumentSnapshot);
    const preem = await fetchContributionsForPreem(preemDoc);

    return { preem, race };
  }
);
