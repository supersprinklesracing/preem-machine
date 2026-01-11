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

// Helper to chunk arrays without external dependency
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const getDoc = cache(getDocInternal);
export const getDocSnap = cache(getDocSnapInternal);

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

/**
 * Batched version of getEventsForSeries to avoid N+1 queries.
 * Fetches all events for a list of series in chunks.
 *
 * NOTE: This relies on 'seriesBrief.id' being present and indexed on Event documents.
 * Firestore automatically indexes single fields, so this should work out of the box
 * as long as the denormalized data is present.
 */
const getEventsForSeriesBatched = async (
  seriesDocs: DocumentSnapshot<Series>[],
): Promise<SeriesWithEvents[]> => {
  if (seriesDocs.length === 0) {
    return [];
  }

  const seriesIds = seriesDocs.map((doc) => doc.id);
  const db = await getFirestore();

  // Firestore 'in' query supports max 30 items
  const seriesIdChunks = chunk(seriesIds, 30);
  const allEvents: Event[] = [];

  await Promise.all(
    seriesIdChunks.map(async (chunkIds) => {
      const snap = await db
        .collectionGroup('events')
        .where('seriesBrief.id', 'in', chunkIds)
        .withConverter(converter(EventSchema))
        .get();
      allEvents.push(...snap.docs.map((d) => d.data()));
    }),
  );

  // Group events by series ID
  const eventsBySeriesId: Record<string, Event[]> = {};
  allEvents.forEach((event) => {
    const seriesId = event.seriesBrief.id;
    if (!eventsBySeriesId[seriesId]) {
      eventsBySeriesId[seriesId] = [];
    }
    eventsBySeriesId[seriesId].push(event);
  });

  // Map back to result structure
  return Promise.all(
    seriesDocs.map(async (seriesDoc) => {
      const seriesId = seriesDoc.id;
      const events = eventsBySeriesId[seriesId] || [];

      // Sort events if needed (e.g. by startDate) - mimic original behavior if implicit
      events.sort((a, b) => {
        const dateA = a.startDate?.getTime() ?? 0;
        const dateB = b.startDate?.getTime() ?? 0;
        return dateA - dateB;
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        series: seriesDoc.data()!,
        children: await getRacesForEventsBatched(events, db),
      };
    }),
  );
};

// Helper to batch fetch races for events
const getRacesForEventsBatched = async (
  events: Event[],
  db: FirebaseFirestore.Firestore,
): Promise<EventWithRaces[]> => {
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const eventIdChunks = chunk(eventIds, 30);
  const allRaces: Race[] = [];

  await Promise.all(
    eventIdChunks.map(async (chunkIds) => {
      const snap = await db
        .collectionGroup('races')
        .where('eventBrief.id', 'in', chunkIds)
        .withConverter(converter(RaceSchema))
        .get();
      allRaces.push(...snap.docs.map((d) => d.data()));
    }),
  );

  const racesByEventId: Record<string, Race[]> = {};
  allRaces.forEach((race) => {
    const eventId = race.eventBrief.id;
    if (!racesByEventId[eventId]) {
      racesByEventId[eventId] = [];
    }
    racesByEventId[eventId].push(race);
  });

  return Promise.all(
    events.map(async (event) => {
      const races = racesByEventId[event.id] || [];
      // Sort races
      races.sort((a, b) => {
        const dateA = a.startDate?.getTime() ?? 0;
        const dateB = b.startDate?.getTime() ?? 0;
        return dateA - dateB;
      });

      return {
        event,
        children: await getPreemsForRacesBatched(races, db),
      };
    }),
  );
};

const getPreemsForRacesBatched = async (
  races: Race[],
  db: FirebaseFirestore.Firestore,
): Promise<RaceWithPreems[]> => {
  if (races.length === 0) return [];

  const raceIds = races.map((r) => r.id);
  const raceIdChunks = chunk(raceIds, 30);
  const allPreems: Preem[] = [];

  await Promise.all(
    raceIdChunks.map(async (chunkIds) => {
      const snap = await db
        .collectionGroup('preems')
        .where('raceBrief.id', 'in', chunkIds)
        .withConverter(converter(PreemSchema))
        .get();
      allPreems.push(...snap.docs.map((d) => d.data()));
    }),
  );

  const preemsByRaceId: Record<string, Preem[]> = {};
  allPreems.forEach((preem) => {
    const raceId = preem.raceBrief.id;
    if (!preemsByRaceId[raceId]) {
      preemsByRaceId[raceId] = [];
    }
    preemsByRaceId[raceId].push(preem);
  });

  return Promise.all(
    races.map(async (race) => {
      const preems = preemsByRaceId[race.id] || [];
      // Next level: Contributions.
      return {
        race,
        children: await getContributionsForPreemsBatched(preems, db),
      };
    }),
  );
};

const getContributionsForPreemsBatched = async (
  preems: Preem[],
  db: FirebaseFirestore.Firestore,
): Promise<PreemWithContributions[]> => {
  if (preems.length === 0) return [];

  const preemIds = preems.map((p) => p.id);
  const preemIdChunks = chunk(preemIds, 30);
  const allContributions: Contribution[] = [];

  await Promise.all(
    preemIdChunks.map(async (chunkIds) => {
      const snap = await db
        .collectionGroup('contributions')
        .where('preemBrief.id', 'in', chunkIds)
        .withConverter(converter(ContributionSchema))
        .get();
      allContributions.push(...snap.docs.map((d) => d.data()));
    }),
  );

  const contributionsByPreemId: Record<string, Contribution[]> = {};
  allContributions.forEach((contribution) => {
    const preemId = contribution.preemBrief.id;
    if (!contributionsByPreemId[preemId]) {
      contributionsByPreemId[preemId] = [];
    }
    contributionsByPreemId[preemId].push(contribution);
  });

  return preems.map((preem) => {
    const contributions = contributionsByPreemId[preem.id] || [];
    return {
      preem,
      children: contributions,
    };
  });
};

export const getSeriesForOrganization = async (
  organizationDoc: DocumentSnapshot<Organization>,
): Promise<SeriesWithEvents[]> => {
  const snap = await organizationDoc.ref
    .collection('series')
    .withConverter(converter(SeriesSchema))
    .get();
  // Use batched fetcher here
  return getEventsForSeriesBatched(snap.docs);
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

    // Optimized with batched fetching
    const serieses = await getEventsForSeriesBatched(seriesSnap.docs);

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

  // Optimize this too if possible, but getEventsForSeries is for ONE series.
  // We can't really batch one item unless we change the implementation to use batching logic internally.
  // But our batching logic is capable of handling one item array.
  return (await getEventsForSeriesBatched([doc]))[0];
});

export const getRenderableEventDataForPage = cache(async (path: DocPath) => {
  const eventSnap = await getDocRefInternal(EventSchema, path);
  const doc = await eventSnap.get();
  if (!doc.exists) {
    notFound(`Event not found: ${path}`);
  }
  // Use our new batch helper for consistency and speed (Race->Preem->Contrib)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const result = await getRacesForEventsBatched([doc.data()!], await getFirestore());
  return result[0];
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

  // Optimize fetching races for these events
  const eventsWithRaces = await getRacesForEventsBatched(
    eventsSnap.docs.map(d => d.data()),
    db
  );

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
