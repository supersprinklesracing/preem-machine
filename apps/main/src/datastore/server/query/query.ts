import 'server-only';

import { type DocumentSnapshot } from 'firebase-admin/firestore';
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

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

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

  if (snap.empty) {
    return result;
  }

  const races = snap.docs.map((doc) => doc.data());
  const raceIds = races.map((r) => r.id);

  // Optimized Fetching: Use collectionGroup with 'in' queries
  const db = await getFirestore();
  const preemBatches = chunk(raceIds, 30);

  const preemSnaps = await Promise.all(
    preemBatches.map((batchIds) =>
      db
        .collectionGroup('preems')
        .where('raceBrief.id', 'in', batchIds)
        .withConverter(converter(PreemSchema))
        .get(),
    ),
  );

  const allPreems = preemSnaps.flatMap((s) => s.docs.map((d) => d.data()));
  const preemIds = allPreems.map((p) => p.id);

  let allContributions: Contribution[] = [];
  if (preemIds.length > 0) {
    const contributionBatches = chunk(preemIds, 30);
    const contributionSnaps = await Promise.all(
      contributionBatches.map((batchIds) =>
        db
          .collectionGroup('contributions')
          .where('preemBrief.id', 'in', batchIds)
          .withConverter(converter(ContributionSchema))
          .get(),
      ),
    );
    allContributions = contributionSnaps.flatMap((s) =>
      s.docs.map((d) => d.data()),
    );
  }

  // Reconstruction
  const contributionsByPreemId = new Map<string, Contribution[]>();
  allContributions.forEach((c) => {
    const pid = c.preemBrief.id;
    if (!contributionsByPreemId.has(pid)) {
      contributionsByPreemId.set(pid, []);
    }
    contributionsByPreemId.get(pid)!.push(c);
  });

  const preemsByRaceId = new Map<string, PreemWithContributions[]>();
  allPreems.forEach((p) => {
    const rid = p.raceBrief.id;
    if (!preemsByRaceId.has(rid)) {
      preemsByRaceId.set(rid, []);
    }
    const children = contributionsByPreemId.get(p.id) || [];
    // Sort contributions by date descending (to match likely expectation, though original code had no explicit sort)
    // Actually, original code using .collection('contributions').get() returns by ID.
    // If we want to be safe, we can sort by ID.
    children.sort((a, b) => a.id.localeCompare(b.id));

    preemsByRaceId.get(rid)!.push({
      preem: p,
      children: children,
    });
  });

  result.children = races.map((race) => {
    const children = preemsByRaceId.get(race.id) || [];
    // Sort preems by ID to ensure deterministic order
    children.sort((a, b) => a.preem.id.localeCompare(b.preem.id));
    return {
      race,
      children,
    };
  });

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
    // Bolt Optimization: Don't fetch nested events/races/preems for organization page
    const serieses: SeriesWithEvents[] = seriesSnap.docs.map((doc) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      series: doc.data()!,
      children: [],
    }));

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

// Helper to chunk queries in parallel
const fetchByParentIds = async <T>(
  collectionName: string,
  parentField: string,
  parentIds: string[],
  schema: any,
): Promise<T[]> => {
  if (parentIds.length === 0) return [];

  const db = await getFirestore();
  const chunks: string[][] = [];
  const chunkSize = 30; // Firestore 'in' query limit

  for (let i = 0; i < parentIds.length; i += chunkSize) {
    chunks.push(parentIds.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const snap = await db
        .collectionGroup(collectionName)
        .where(parentField, 'in', chunk)
        .withConverter(converter(schema))
        .get();
      return snap.docs.map((d) => d.data());
    }),
  );

  return results.flat() as T[];
};

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

  // Optimization: Fetch all races, preems, and contributions in batch to avoid N+1 queries.
  // Instead of traversing down the tree (Event -> Race -> Preem -> Contribution) which causes
  // N events * M races * P preems queries, we fetch all relevant child documents in single batch queries.

  // 1. Get all event IDs
  const eventIds = eventsSnap.docs.map((doc) => doc.id);

  // 2. Fetch all races for these events
  const races = await fetchByParentIds<Race>(
    'races',
    'eventBrief.id',
    eventIds,
    RaceSchema,
  );

  // 3. Fetch all preems for these races
  const raceIds = races.map((r) => r.id);
  const fetchedPreems = await fetchByParentIds<Preem>(
    'preems',
    'raceBrief.id',
    raceIds,
    PreemSchema,
  );

  // 4. Fetch all contributions for these preems
  const preemIds = fetchedPreems.map((p) => p.id);
  const fetchedContributions = await fetchByParentIds<Contribution>(
    'contributions',
    'preemBrief.id',
    preemIds,
    ContributionSchema,
  );

  // 5. Reconstruct the tree
  // Group contributions by preem
  const contributionsByPreem = new Map<string, Contribution[]>();
  fetchedContributions.forEach((c) => {
    const pid = c.preemBrief.id;
    if (!contributionsByPreem.has(pid)) {
      contributionsByPreem.set(pid, []);
    }
    contributionsByPreem.get(pid)?.push(c);
  });

  // Group preems by race
  const preemsByRace = new Map<string, PreemWithContributions[]>();
  fetchedPreems.forEach((p) => {
    const rid = p.raceBrief.id;
    if (!preemsByRace.has(rid)) {
      preemsByRace.set(rid, []);
    }
    const children = contributionsByPreem.get(p.id) || [];
    // Sort contributions by date descending (newest first)
    children.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA;
    });

    preemsByRace.get(rid)?.push({
      preem: p,
      children,
    });
  });

  // Group races by event
  const racesByEvent = new Map<string, RaceWithPreems[]>();
  races.forEach((r) => {
    const eid = r.eventBrief.id;
    if (!racesByEvent.has(eid)) {
      racesByEvent.set(eid, []);
    }

    const children = preemsByRace.get(r.id) || [];
    // Sort preems by name
    children.sort((a, b) => (a.preem.name || '').localeCompare(b.preem.name || ''));

    racesByEvent.get(eid)?.push({
      race: r,
      children,
    });
  });

  const eventsWithRaces: EventWithRaces[] = eventsSnap.docs.map((doc) => {
    const event = doc.data();
    const children = racesByEvent.get(event.id) || [];
    // Sort races by start date
    children.sort((a, b) => {
      const dateA = a.race.startDate instanceof Date ? a.race.startDate.getTime() : 0;
      const dateB = b.race.startDate instanceof Date ? b.race.startDate.getTime() : 0;
      return dateA - dateB;
    });

    return {
      event,
      children,
    };
  });

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
