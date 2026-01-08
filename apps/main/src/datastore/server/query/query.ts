import 'server-only';

import { type DocumentSnapshot, type Firestore } from 'firebase-admin/firestore';
import { cache } from 'react';

import { getFirestore } from '@/firebase/server/firebase-admin';

import { notFound } from '../../errors';
import { docId, DocPath } from '../../paths';
import {
  EventWithRaces,
  OrganizationWithSeries,
  PreemWithContributions,
  RaceWithPreems,
  SeriesWithEvents,
} from '../../query-schema';
import {
  Contribution,
  ContributionSchema,
  Event,
  EventSchema,
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
import { converter } from '../converters';
import { getDocInternal, getDocRefInternal, getDocSnapInternal } from '../util';

export const getDoc = cache(getDocInternal);
export const getDocSnap = cache(getDocSnapInternal);

// Helper to batch fetch children using collectionGroup
async function fetchByParents<T>(
  db: Firestore,
  collectionName: string,
  field: string,
  parentIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
): Promise<T[]> {
  if (parentIds.length === 0) return [];
  const chunks = [];
  const uniqueIds = [...new Set(parentIds)];
  for (let i = 0; i < uniqueIds.length; i += 30) {
    chunks.push(uniqueIds.slice(i, i + 30));
  }

  const snaps = await Promise.all(
    chunks.map((chunk) =>
      db
        .collectionGroup(collectionName)
        .where(field, 'in', chunk)
        .withConverter(converter(schema))
        .get(),
    ),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snaps.flatMap((s) => s.docs.map((d) => d.data())) as any as T[];
}

function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

const getPreemWithContributions = async (
  preemDoc: DocumentSnapshot<Preem>,
): Promise<PreemWithContributions> => {
  const preem = preemDoc.data();
  if (!preem) {
    notFound(`Preem not found: ${preemDoc.ref.path}`);
  }
  const contributionsSnap = await preemDoc.ref
    .collection('contributions')
    .withConverter(converter(ContributionSchema))
    .get();
  return {
    preem,
    children: contributionsSnap.docs.map((doc) => doc.data()),
  };
};

const getRaceWithPreems = async (
  raceDoc: DocumentSnapshot<Race>,
): Promise<RaceWithPreems> => {
  const result: RaceWithPreems = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    race: raceDoc.data()!,
    children: [],
  };
  const snap = await raceDoc.ref
    .collection('preems')
    .withConverter(converter(PreemSchema))
    .get();
  result.children = await Promise.all(snap.docs.map(getPreemWithContributions));
  return result;
};

const getRacesForEvent = async (
  eventDoc: DocumentSnapshot<Event>,
): Promise<EventWithRaces> => {
  const result: EventWithRaces = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event: eventDoc.data()!,
    children: [],
  };
  const snap = await eventDoc.ref
    .collection('races')
    .withConverter(converter(RaceSchema))
    .get();
  result.children = await Promise.all(snap.docs.map(getRaceWithPreems));
  return result;
};

const getEventsForSeries = async (
  seriesDoc: DocumentSnapshot<Series>,
): Promise<SeriesWithEvents> => {
  const result: SeriesWithEvents = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    series: seriesDoc.data()!,
    children: [],
  };
  const snap = await seriesDoc.ref
    .collection('events')
    .withConverter(converter(EventSchema))
    .get();
  result.children = await Promise.all(snap.docs.map(getRacesForEvent));
  return result;
};

export const getSeriesForOrganization = async (
  organizationDoc: DocumentSnapshot<Organization>,
): Promise<SeriesWithEvents[]> => {
  const snap = await organizationDoc.ref
    .collection('series')
    .withConverter(converter(SeriesSchema))
    .get();
  return Promise.all(snap.docs.map(getEventsForSeries));
};

export const getOrganizationWithSeries = async (
  organizationDoc: DocumentSnapshot<Organization>,
): Promise<OrganizationWithSeries> => {
  const result: OrganizationWithSeries = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    organization: organizationDoc.data()!,
    children: [],
  };
  result.children = await getSeriesForOrganization(organizationDoc);
  return result;
};

export const getOrganizations = cache(async (): Promise<Organization[]> => {
  const db = await getFirestore();
  const orgsSnap = await db
    .collection('organizations')
    .withConverter(converter(OrganizationSchema))
    .get();
  return orgsSnap.docs.map((doc) => doc.data());
});

export const getUsers = cache(async (): Promise<User[]> => {
  const db = await getFirestore();
  const usersSnap = await db
    .collection('users')
    .withConverter(converter(UserSchema))
    .get();
  return usersSnap.docs.map((doc) => doc.data());
});

export const getUserById = cache(async (id: string): Promise<User> => {
  const db = await getFirestore();
  const docSnap = await db
    .collection('users')
    .doc(id)
    .withConverter(converter(UserSchema))
    .get();
  if (!docSnap.exists) {
    notFound('User doc not found: ' + id);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return docSnap.data()!;
});

export const getOrganizationsByIds = cache(
  async (ids: string[]): Promise<Organization[]> => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return [];
    }
    const db = await getFirestore();
    const orgsSnap = await db
      .collection('organizations')
      .where('id', 'in', uniqueIds)
      .withConverter(converter(OrganizationSchema))
      .get();
    return orgsSnap.docs.map((doc) => doc.data());
  },
);

export const getOrganizationByStripeConnectAccountId = async (
  accountId: string,
) => {
  const db = await getFirestore();
  const orgsSnap = await db
    .collection('organizations')
    .where('stripe.connectAccountId', '==', accountId)
    .withConverter(converter(OrganizationSchema))
    .limit(1)
    .get();

  if (orgsSnap.empty) {
    notFound('Organization not found.');
  }
  return orgsSnap.docs[0];
};

export const getUsersByIds = cache(async (ids: string[]): Promise<User[]> => {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) {
    return [];
  }
  const db = await getFirestore();
  const usersSnap = await db
    .collection('users')
    .where('id', 'in', uniqueIds)
    .withConverter(converter(UserSchema))
    .get();
  return usersSnap.docs.map((doc) => doc.data());
});

export const getEventsForOrganizations = cache(
  async (organizationIds: string[]): Promise<Event[]> => {
    if (organizationIds.length === 0) {
      return [];
    }
    const db = await getFirestore();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const eventsSnap = await db
      .collectionGroup('events')
      .where('seriesBrief.organizationBrief.id', 'in', organizationIds)
      .where('endDate', '>=', oneDayAgo)
      .orderBy('endDate', 'asc')
      .withConverter(converter(EventSchema))
      .get();
    return eventsSnap.docs.map((doc) => doc.data());
  },
);

export const getEventsForUser = cache(
  async (userId: string): Promise<Event[]> => {
    const user = await getUserById(userId);
    const organizationIds =
      user?.organizationRefs?.map((ref) => ref.id).filter((id) => !!id) ?? [];
    return getEventsForOrganizations(organizationIds);
  },
);

export const getRenderablePreemDataForPage = cache(async (path: DocPath) => {
  const preemDocSnap = await getDocRefInternal(PreemSchema, path);
  const doc = await preemDocSnap.get();
  if (!doc.exists) {
    notFound(`Preem not found: ${path}`);
  }

  return await getPreemWithContributions(doc);
});

export const getRenderableRaceDataForPage = cache(async (path: DocPath) => {
  const raceSnap = await getDocRefInternal(RaceSchema, path);
  const doc = await raceSnap.get();
  if (!doc.exists) {
    notFound(`Race not found: ${path}`);
  }

  return await getRaceWithPreems(doc);
});

export const getRacePageDataWithUsers = cache(async (path: string) => {
  const { race, children } = await getRenderableRaceDataForPage(path);

  const contributorIds =
    children
      .flatMap(({ children }) => children.map((c) => c.contributor?.id))
      .filter((id): id is string => !!id) ?? [];

  const uniqueUserIds = [...new Set(contributorIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

  return {
    race,
    children,
    users,
  };
});

export const getPreemPageDataWithUsers = cache(async (path: string) => {
  const { preem, children } = await getRenderablePreemDataForPage(path);

  const contributorIds =
    children.map((c) => c.contributor?.id).filter((id): id is string => !!id) ??
    [];

  const uniqueUserIds = [...new Set(contributorIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];
  const usersMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  );

  const childrenWithUsers = children.map((c) => ({
    contribution: c,
    contributor: c.contributor?.id ? usersMap[c.contributor.id] : undefined,
  }));

  return {
    preem,
    children: childrenWithUsers,
    users,
  };
});

export const getRenderableOrganizationDataForPage = cache(
  async (path: DocPath) => {
    const orgDoc = await getDocRefInternal(OrganizationSchema, path);
    const doc = await orgDoc.get();
    if (!doc.exists) {
      notFound(`Org not found: ${path}`);
    }

    const organization = doc.data();
    if (!organization) {
      notFound(`Org not found: ${path}`);
    }

    const seriesSnap = await doc.ref
      .collection('series')
      .withConverter(converter(SeriesSchema))
      .get();
    const serieses = await Promise.all(seriesSnap.docs.map(getEventsForSeries));

    const memberIds =
      organization.memberRefs
        ?.map((ref) => ref.id)
        .filter((id): id is string => !!id) ?? [];
    const members = memberIds.length > 0 ? await getUsersByIds(memberIds) : [];

    return { organization, serieses, members };
  },
);

export const getRenderableSeriesDataForPage = cache(async (path: DocPath) => {
  const seriesSnap = await getDocRefInternal(SeriesSchema, path);
  const doc = await seriesSnap.get();
  if (!doc.exists) {
    notFound(`Series not found: ${path}`);
  }

  return await getEventsForSeries(doc);
});

export const getRenderableEventDataForPage = cache(async (path: DocPath) => {
  const eventSnap = await getDocRefInternal(EventSchema, path);
  const doc = await eventSnap.get();
  if (!doc.exists) {
    notFound(`Event not found: ${path}`);
  }
  return await getRacesForEvent(doc);
});

export const getRenderableHomeDataForPage = cache(async () => {
  const db = await getFirestore();
  const now = new Date();

  // Fetch upcoming events
  const eventsSnap = await db
    .collectionGroup('events')
    .where('startDate', '>=', now)
    .orderBy('startDate', 'asc')
    .withConverter(converter(EventSchema))
    .get();
  const events = eventsSnap.docs.map((d) => d.data());
  const eventIds = events.map((e) => e.id);

  // Optimized Fetching: Fetch all descendants in batch using collectionGroup 'in' queries
  // instead of N+1 recursive fetching.

  // 1. Fetch Races for events
  const races = await fetchByParents<Race>(
    db,
    'races',
    'eventBrief.id',
    eventIds,
    RaceSchema,
  );
  const raceIds = races.map((r) => r.id);

  // 2. Fetch Preems for races
  const preemsForRaces = await fetchByParents<Preem>(
    db,
    'preems',
    'raceBrief.id',
    raceIds,
    PreemSchema,
  );
  const preemIds = preemsForRaces.map((p) => p.id);

  // 3. Fetch Contributions for preems
  const contributionsForPreems = await fetchByParents<Contribution>(
    db,
    'contributions',
    'preemBrief.id',
    preemIds,
    ContributionSchema,
  );

  // Stitch the tree back together in memory

  // Group contributions by preem ID
  const contribsByPreem = groupBy(
    contributionsForPreems,
    (c) => c.preemBrief.id,
  );

  // Map preems to PreemWithContributions
  const preemsByRace: Record<string, PreemWithContributions[]> = {};
  preemsForRaces.forEach((p) => {
    const rid = p.raceBrief.id;
    if (!preemsByRace[rid]) preemsByRace[rid] = [];
    preemsByRace[rid].push({
      preem: p,
      children: contribsByPreem[p.id] || [],
    });
  });

  // Map races to RaceWithPreems
  const racesByEvent: Record<string, RaceWithPreems[]> = {};
  races.forEach((r) => {
    const eid = r.eventBrief.id;
    if (!racesByEvent[eid]) racesByEvent[eid] = [];
    racesByEvent[eid].push({
      race: r,
      children: preemsByRace[r.id] || [],
    });
  });

  // Map events to EventWithRaces
  const eventsWithRaces: EventWithRaces[] = events.map((e) => ({
    event: e,
    children: racesByEvent[e.id] || [],
  }));

  // Original queries for side-lists (preserved)
  // Fetch upcoming preems
  const preemsSnap = await db
    .collectionGroup('preems')
    .where('raceBrief.startDate', '>=', now)
    .orderBy('raceBrief.startDate', 'asc')
    .withConverter(converter(PreemSchema))
    .get();
  const preems = preemsSnap.docs.map((doc) => doc.data());

  const contributionsSnap = await db
    .collectionGroup('contributions')
    .withConverter(converter(ContributionSchema))
    .orderBy('date', 'desc')
    .limit(20)
    .get();
  const contributions = contributionsSnap.docs.map((doc) => doc.data());

  return {
    eventsWithRaces,
    contributions,
    preems,
  };
});

export const getRenderableUserDataForPage = cache(async (path: DocPath) => {
  const user = await getDocInternal(UserSchema, path);
  if (!user) {
    notFound('User doc not found: ' + path);
  }

  const db = await getFirestore();
  const contributionsSnap = await db
    .collectionGroup('contributions')
    .where('contributor.id', '==', docId(path))
    .withConverter(converter(ContributionSchema))
    .get();

  const contributions = contributionsSnap.docs.map((doc) =>
    doc.data(),
  ) as Contribution[];

  const organizationIds =
    user.organizationRefs?.map((ref) => ref.id).filter((id) => !!id) ?? [];
  const organizations =
    organizationIds.length > 0
      ? await getOrganizationsByIds(organizationIds)
      : [];

  return {
    user,
    contributions,
    organizations,
  };
});

export const anonymousUser = () => ({
  id: undefined,
  name: 'Anonymous',
  avatarUrl: 'https://placehold.co/100x100.png',
});

export const getRaceWithUsers = cache(
  async (
    raceId: string,
  ): Promise<{
    race: RaceWithPreems;
    users: User[];
  }> => {
    const raceWithPreems = await getRenderableRaceDataForPage(raceId);
    if (!raceWithPreems) {
      notFound('Race not found');
    }

    const contributorIds =
      raceWithPreems.children
        ?.flatMap(({ children }) => children.map((c) => c.contributor?.id))
        .filter((id): id is string => !!id) ?? [];

    const uniqueUserIds = [...new Set(contributorIds)];
    const users =
      uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

    return {
      race: raceWithPreems,
      users: users as User[],
    };
  },
);

export const getRacesForEventId = cache(
  async (eventId: string): Promise<Race[]> => {
    const db = await getFirestore();
    const eventSnap = await db
      .collectionGroup('events')
      .where('id', '==', eventId)
      .withConverter(converter(EventSchema))
      .limit(1)
      .get();
    if (eventSnap.empty) {
      return [];
    }
    const racesSnap = await eventSnap.docs[0].ref
      .collection('races')
      .withConverter(converter(RaceSchema))
      .get();
    return racesSnap.docs.map((doc) => doc.data());
  },
);

export const getPreemsForRaceId = cache(
  async (raceId: string): Promise<Preem[]> => {
    const db = await getFirestore();
    const raceSnap = await db
      .collectionGroup('races')
      .where('id', '==', raceId)
      .withConverter(converter(RaceSchema))
      .limit(1)
      .get();
    if (raceSnap.empty) {
      return [];
    }
    const preemsSnap = await raceSnap.docs[0].ref
      .collection('preems')
      .withConverter(converter(PreemSchema))
      .get();
    return preemsSnap.docs.map((doc) => doc.data());
  },
);

export const getContributionsForPreemId = cache(
  async (preemId: string): Promise<Contribution[]> => {
    const db = await getFirestore();
    const preemSnap = await db
      .collectionGroup('preems')
      .where('id', '==', preemId)
      .withConverter(converter(PreemSchema))
      .limit(1)
      .get();
    if (preemSnap.empty) {
      return [];
    }
    const contributionsSnap = await preemSnap.docs[0].ref
      .collection('contributions')
      .withConverter(converter(ContributionSchema))
      .get();
    return contributionsSnap.docs.map((doc) => doc.data());
  },
);

export const getOrganizationFromPath = cache(async (path: string) => {
  const pathParts = path.split('/');
  if (pathParts.length < 2 || pathParts[0] !== 'organizations') {
    notFound(`Invalid path for getting organization: ${path}`);
  }
  return getDocInternal(OrganizationSchema, `organizations/${pathParts[1]}`);
});
