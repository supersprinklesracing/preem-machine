import 'server-only';

import { getFirestore } from '@/firebase-admin';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
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
import { PreemPageData } from '../app/(main)/preem/[id]/Preem';
import { genericConverter } from './converters';
import { RacePageData } from '../app/(main)/race/[id]/Race';
import { OrganizationPageData } from '../app/(main)/organization/[id]/Organization';
import { SeriesPageData } from '../app/(main)/series/[id]/Series';
import { EventPageData } from '../app/(main)/event/[id]/Event';
import { HomePageData } from '../app/(main)/Home';
import { UserPageData } from '../app/(main)/user/[[...id]]/User';
import { ManagePageData } from '../app/(main)/manage/Manage';
import { AdminPageData } from '../app/(main)/admin/Admin';

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
  const preem = doc.data() as FirestorePreem;
  const contributionsSnap = await doc.ref
    .collection('contributions')
    .withConverter(genericConverter<FirestoreContribution>())
    .get();
  const contributionHistory = contributionsSnap.docs.map((doc) => doc.data());
  return { ...preem, contributionHistory };
}

async function fetchPreemsForRace(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<RaceWithPreems> {
  const race = doc.data() as FirestoreRace;
  const preemsSnap = await doc.ref
    .collection('preems')
    .withConverter(genericConverter<FirestorePreem>())
    .get();
  const preems = await Promise.all(
    preemsSnap.docs.map(fetchContributionsForPreem)
  );
  return { ...race, preems };
}

async function fetchRacesForEvent(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<EventWithRaces> {
  const event = doc.data() as FirestoreEvent;
  const racesSnap = await doc.ref
    .collection('races')
    .withConverter(genericConverter<FirestoreRace>())
    .get();
  const races = await Promise.all(racesSnap.docs.map(fetchPreemsForRace));
  return { ...event, races };
}

async function fetchEventsForSeries(
  doc: QueryDocumentSnapshot<DocumentData>
): Promise<SeriesWithEvents> {
  const series = doc.data() as FirestoreRaceSeries;
  const eventsSnap = await doc.ref
    .collection('events')
    .withConverter(genericConverter<FirestoreEvent>())
    .get();
  const events = await Promise.all(eventsSnap.docs.map(fetchRacesForEvent));
  return { ...series, events };
}

// --- Exported Data Access Functions ---

export const getUsers = cache(async (): Promise<FirestoreUser[]> => {
  const db = await getFirestore();
  const usersSnap = await db
    .collection('users')
    .withConverter(genericConverter<FirestoreUser>())
    .get();
  return usersSnap.docs.map((doc) => doc.data());
});

export const getUserById = cache(
  async (id: string | undefined): Promise<FirestoreUser | undefined> => {
    if (!id) return undefined;
    const db = await getFirestore();
    const docSnap = await db
      .collection('users')
      .doc(id)
      .withConverter(genericConverter<FirestoreUser>())
      .get();
    return docSnap.data();
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
      .withConverter(genericConverter<FirestoreUser>())
      .get();
    return usersSnap.docs.map((doc) => doc.data());
  }
);

export const getRenderablePreemDataForPage = cache(
  async (id: string): Promise<PreemPageData | undefined> => {
    const db = await getFirestore();
    const preemSnap = await db
      .collectionGroup('preems')
      .where('id', '==', id)
      .withConverter(genericConverter<FirestorePreem>())
      .limit(1)
      .get();
    if (preemSnap.empty) return undefined;

    const preemDoc = preemSnap.docs[0];
    const raceRef = preemDoc.ref.parent.parent;
    if (!raceRef) return undefined;

    const raceDoc = await raceRef
      .withConverter(genericConverter<FirestoreRace>())
      .get();
    if (!raceDoc.exists) return undefined;

    const race = await fetchPreemsForRace(raceDoc as QueryDocumentSnapshot);
    const preem = await fetchContributionsForPreem(preemDoc);

    const contributorIds =
      preem.contributionHistory
        ?.map((c) => c.contributorRef?.id)
        .filter((id): id is string => !!id) ?? [];
    const sponsorId = preem.sponsorUserRef?.id;
    const allUserIds = [
      ...new Set(sponsorId ? [...contributorIds, sponsorId] : contributorIds),
    ];

    const userDocs =
      allUserIds.length > 0 ? await getUsersByIds(allUserIds) : [];
    const users = userDocs.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, FirestoreUser>);

    return {
      preem: preem as unknown as PreemPageData['preem'],
      race: race as unknown as PreemPageData['race'],
      users: users as unknown as PreemPageData['users'],
    };
  }
);

export const getRenderableRaceDataForPage = cache(
  async (id: string): Promise<RacePageData | undefined> => {
    const db = await getFirestore();
    const raceSnap = await db
      .collectionGroup('races')
      .where('id', '==', id)
      .withConverter(genericConverter<FirestoreRace>())
      .limit(1)
      .get();
    if (raceSnap.empty) return undefined;

    const raceDoc = raceSnap.docs[0];
    const eventRef = raceDoc.ref.parent.parent;
    if (!eventRef) return undefined;

    const eventDoc = await eventRef
      .withConverter(genericConverter<FirestoreEvent>())
      .get();
    if (!eventDoc.exists) return undefined;

    const race = await fetchPreemsForRace(raceDoc);
    const event = eventDoc.data();

    const userIds = new Set<string>();
    race.preems.forEach((p) => {
      if (p.sponsorUserRef?.id) userIds.add(p.sponsorUserRef.id);
      p.contributionHistory.forEach((c) => {
        if (c.contributorRef?.id) userIds.add(c.contributorRef.id);
      });
    });

    const userDocs =
      userIds.size > 0 ? await getUsersByIds(Array.from(userIds)) : [];
    const users = userDocs.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, FirestoreUser>);

    return {
      race: race as unknown as RacePageData['race'],
      event: event as unknown as RacePageData['event'],
      users: users as unknown as RacePageData['users'],
    };
  }
);

export const getRenderableOrganizationDataForPage = cache(
  async (id: string): Promise<OrganizationPageData | undefined> => {
    const db = await getFirestore();
    const orgDoc = await db
      .collection('organizations')
      .doc(id)
      .withConverter(genericConverter<FirestoreOrganization>())
      .get();
    if (!orgDoc.exists) return undefined;

    const organization = orgDoc.data();

    const seriesSnap = await orgDoc.ref
      .collection('series')
      .withConverter(genericConverter<FirestoreRaceSeries>())
      .get();
    const series = await Promise.all(seriesSnap.docs.map(fetchEventsForSeries));

    const memberIds =
      organization.memberRefs
        ?.map((ref) => ref.id)
        .filter((id): id is string => !!id) ?? [];
    const members = memberIds.length > 0 ? await getUsersByIds(memberIds) : [];

    return {
      organization:
        organization as unknown as OrganizationPageData['organization'],
      series: series as unknown as OrganizationPageData['series'],
      members: members as unknown as OrganizationPageData['members'],
    };
  }
);

export const getRenderableSeriesDataForPage = cache(
  async (id: string): Promise<SeriesPageData | undefined> => {
    const db = await getFirestore();
    const seriesSnap = await db
      .collectionGroup('series')
      .where('id', '==', id)
      .withConverter(genericConverter<FirestoreRaceSeries>())
      .limit(1)
      .get();
    if (seriesSnap.empty) return undefined;

    const seriesDoc = seriesSnap.docs[0];
    const seriesWithEvents = await fetchEventsForSeries(seriesDoc);

    const orgId = seriesDoc.ref.parent.parent?.id;
    if (!orgId) throw new Error(`Could not find organization for series ${id}`);
    const organizationDoc = await db
      .collection('organizations')
      .doc(orgId)
      .withConverter(genericConverter<FirestoreOrganization>())
      .get();
    if (!organizationDoc.exists)
      throw new Error(`Could not find organization with id ${orgId}`);

    const enrichedEvents = seriesWithEvents.events.map((event) => {
      const totalCollected = event.races.reduce(
        (sum, race) =>
          sum + race.preems.reduce((pSum, p) => pSum + (p.prizePool ?? 0), 0),
        0
      );
      const totalContributors = new Set(
        event.races.flatMap((r) =>
          r.preems.flatMap((p) =>
            p.contributionHistory
              .map((c) => c.contributorRef?.id)
              .filter(Boolean)
          )
        )
      ).size;
      return { ...event, totalCollected, totalContributors };
    });

    return {
      series: {
        ...seriesWithEvents,
        events: enrichedEvents,
      } as unknown as SeriesPageData['series'],
      organization:
        organizationDoc.data() as unknown as SeriesPageData['organization'],
    };
  }
);

export const getRenderableEventDataForPage = cache(
  async (id: string): Promise<EventPageData | undefined> => {
    const db = await getFirestore();
    const eventSnap = await db
      .collectionGroup('events')
      .where('id', '==', id)
      .withConverter(genericConverter<FirestoreEvent>())
      .limit(1)
      .get();
    if (eventSnap.empty) return undefined;

    const eventDoc = eventSnap.docs[0];
    const eventWithRaces = await fetchRacesForEvent(eventDoc);

    const seriesRef = eventDoc.ref.parent.parent;
    if (!seriesRef) throw new Error(`Could not find series for event ${id}`);
    const seriesDoc = await seriesRef
      .withConverter(genericConverter<FirestoreRaceSeries>())
      .get();
    if (!seriesDoc.exists)
      throw new Error(`Could not find series with id ${seriesRef.id}`);

    const orgRef = seriesDoc.ref.parent.parent;
    if (!orgRef)
      throw new Error(`Could not find organization for series ${seriesRef.id}`);
    const orgDoc = await orgRef
      .withConverter(genericConverter<FirestoreOrganization>())
      .get();
    if (!orgDoc.exists)
      throw new Error(`Could not find organization with id ${orgRef.id}`);

    return {
      event: eventWithRaces as unknown as EventPageData['event'],
      series: seriesDoc.data() as unknown as EventPageData['series'],
      organization: orgDoc.data() as unknown as EventPageData['organization'],
    };
  }
);

export const getRenderableHomeDataForPage = cache(
  async (): Promise<HomePageData> => {
    const db = await getFirestore();
    const eventsSnap = await db
      .collectionGroup('events')
      .withConverter(genericConverter<FirestoreEvent>())
      .get();
    const eventsWithRaces = await Promise.all(
      eventsSnap.docs.map(fetchRacesForEvent)
    );

    const contributionsSnap = await db
      .collectionGroup('contributions')
      .withConverter(genericConverter<FirestoreContribution>())
      .orderBy('date', 'desc')
      .limit(20)
      .get();
    const contributions = contributionsSnap.docs.map((d) => d.data());

    const userIds = new Set<string>();
    contributions.forEach((c) => {
      if (c.contributorRef?.id) userIds.add(c.contributorRef.id);
    });

    const users =
      userIds.size > 0 ? await getUsersByIds(Array.from(userIds)) : [];
    const usersMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, FirestoreUser>);

    const enrichedContributions = await Promise.all(
      contributions.map(async (c) => {
        return {
          ...c,
          preemName: 'A Preem',
          raceName: 'A Race',
          raceId: 'race-1',
          preemId: c.id,
        };
      })
    );

    return {
      eventsWithRaces:
        eventsWithRaces as unknown as HomePageData['eventsWithRaces'],
      users: usersMap as unknown as HomePageData['users'],
      contributions:
        enrichedContributions as unknown as HomePageData['contributions'],
    };
  }
);

export const getRenderableUserDataForPage = cache(
  async (id: string): Promise<UserPageData | undefined> => {
    const db = await getFirestore();
    const user = await getUserById(id);
    if (!user) return undefined;

    const userRef = db.collection('users').doc(id);
    const contributionsSnap = await db
      .collectionGroup('contributions')
      .where('contributorRef', '==', userRef)
      .withConverter(genericConverter<FirestoreContribution>())
      .get();

    const contributions = await Promise.all(
      contributionsSnap.docs.map(async (doc) => {
        const contribution = doc.data();
        const preemRef = doc.ref.parent.parent;
        const raceRef = preemRef?.parent.parent;

        const preem = preemRef
          ? (
              await preemRef
                .withConverter(genericConverter<FirestorePreem>())
                .get()
            ).data()
          : undefined;
        const race = raceRef
          ? (
              await raceRef
                .withConverter(genericConverter<FirestoreRace>())
                .get()
            ).data()
          : undefined;

        return {
          ...contribution,
          raceName: race?.name ?? 'Unknown Race',
          preemName: preem?.name ?? 'Unknown Preem',
        };
      })
    );

    return {
      user: user as unknown as UserPageData['user'],
      contributions: contributions as unknown as UserPageData['contributions'],
    };
  }
);

export const getRenderableManageDataForPage = cache(
  async (organizationId: string): Promise<ManagePageData> => {
    const db = await getFirestore();
    const seriesSnap = await db
      .collection('organizations')
      .doc(organizationId)
      .collection('series')
      .withConverter(genericConverter<FirestoreRaceSeries>())
      .get();
    const series = await Promise.all(seriesSnap.docs.map(fetchEventsForSeries));

    const enrichedSeries = series.map((s) => {
      const enrichedEvents = s.events.map((event) => {
        const totalCollected = event.races.reduce(
          (sum, race) =>
            sum + race.preems.reduce((pSum, p) => pSum + (p.prizePool ?? 0), 0),
          0
        );
        const totalContributors = new Set(
          event.races.flatMap((r) =>
            r.preems.flatMap((p) =>
              p.contributionHistory
                .map((c) => c.contributorRef?.id)
                .filter(Boolean)
            )
          )
        ).size;
        return { ...event, totalCollected, totalContributors };
      });
      return { ...s, events: enrichedEvents };
    });

    return {
      raceSeries: enrichedSeries as unknown as ManagePageData['raceSeries'],
    };
  }
);

export const getRenderableAdminDataForPage = cache(
  async (): Promise<AdminPageData> => {
    const users = await getUsers();
    return {
      users: users as unknown as AdminPageData['users'],
    };
  }
);
