import 'server-only';

import { type DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { cache } from 'react';

import { getFirestore } from '@/firebase/server/firebase-admin';

import { notFound } from '../../errors';
import { docId, DocPath } from '../../paths';
import {
  ContributionWithUser,
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
  const db = await getFirestore();
  const contributionsSnap = await db
    .collection('contributions')
    .where('preemId', '==', preem.id)
    .withConverter(converter(ContributionSchema))
    .get();

  const contributions = contributionsSnap.docs.map((doc) => doc.data());
  const userIds = contributions
    .map((c) => c.userId)
    .filter((id): id is string => !!id);
  const uniqueUserIds = [...new Set(userIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];
  const usersMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  );

  return {
    preem,
    children: contributions.map((c) => ({
      contribution: c,
      contributor: c.userId ? usersMap[c.userId] : undefined,
    })),
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
  const db = await getFirestore();
  const snap = await db
    .collection('preems')
    .where('raceId', '==', result.race.id)
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
  const db = await getFirestore();
  const snap = await db
    .collection('races')
    .where('eventId', '==', result.event.id)
    .withConverter(converter(RaceSchema))
    .get();

  if (snap.empty) {
    return result;
  }

  const races = snap.docs.map((doc) => doc.data());
  const raceIds = races.map((r) => r.id);

  // Optimized Fetching: Use 'in' queries on root collections
  const preemBatches = chunk(raceIds, 30);

  const preemSnaps = await Promise.all(
    preemBatches.map((batchIds) =>
      db
        .collection('preems')
        .where('raceId', 'in', batchIds)
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
          .collection('contributions')
          .where('preemId', 'in', batchIds)
          .withConverter(converter(ContributionSchema))
          .get(),
      ),
    );
    allContributions = contributionSnaps.flatMap((s) =>
      s.docs.map((d) => d.data()),
    );
  }

  // Fetch users for contributions
  const userIds = allContributions
    .map((c) => c.userId)
    .filter((id): id is string => !!id);
  const uniqueUserIds = [...new Set(userIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];
  const usersMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  );

  // Reconstruction
  const contributionsByPreemId = new Map<string, ContributionWithUser[]>();
  allContributions.forEach((c) => {
    const pid = c.preemId;
    if (!pid) return;
    let list = contributionsByPreemId.get(pid);
    if (!list) {
      list = [];
      contributionsByPreemId.set(pid, list);
    }
    list.push({
      contribution: c,
      contributor: c.userId ? usersMap[c.userId] : undefined,
    });
  });

  const preemsByRaceId = new Map<string, PreemWithContributions[]>();
  allPreems.forEach((p) => {
    const rid = p.raceId;
    if (!rid) return;
    let list = preemsByRaceId.get(rid);
    if (!list) {
      list = [];
      preemsByRaceId.set(rid, list);
    }
    const children = contributionsByPreemId.get(p.id) || [];
    children.sort((a, b) => a.contribution.id.localeCompare(b.contribution.id));

    list.push({
      preem: p,
      children: children,
    });
  });

  result.children = races.map((race) => {
    const children = preemsByRaceId.get(race.id) || [];
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
  const db = await getFirestore();
  const snap = await db
    .collection('events')
    .where('seriesId', '==', result.series.id)
    .withConverter(converter(EventSchema))
    .get();
  result.children = await Promise.all(snap.docs.map(getRacesForEvent));
  return result;
};

export const getSeriesForOrganization = async (
  organizationDoc: DocumentSnapshot<Organization>,
): Promise<SeriesWithEvents[]> => {
  const db = await getFirestore();
  const orgData = organizationDoc.data();
  if (!orgData) return [];
  const snap = await db
    .collection('series')
    .where('organizationId', '==', orgData.id)
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
    const orgBatches = chunk(uniqueIds, 30);
    const snaps = await Promise.all(
      orgBatches.map((batch) =>
        db
          .collection('organizations')
          .where('id', 'in', batch)
          .withConverter(converter(OrganizationSchema))
          .get(),
      ),
    );
    return snaps.flatMap((snap) => snap.docs.map((doc) => doc.data()));
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
  const userBatches = chunk(uniqueIds, 30);
  const snaps = await Promise.all(
    userBatches.map((batch) =>
      db
        .collection('users')
        .where('id', 'in', batch)
        .withConverter(converter(UserSchema))
        .get(),
    ),
  );
  return snaps.flatMap((snap) => snap.docs.map((doc) => doc.data()));
});

export const getEventsForOrganizations = cache(
  async (organizationIds: string[]): Promise<Event[]> => {
    if (organizationIds.length === 0) {
      return [];
    }
    const db = await getFirestore();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const orgBatches = chunk(organizationIds, 30);
    const snaps = await Promise.all(
      orgBatches.map((batch) =>
        db
          .collection('events')
          .where('organizationId', 'in', batch)
          .where('endDate', '>=', Timestamp.fromDate(oneDayAgo))
          .orderBy('endDate', 'asc')
          .withConverter(converter(EventSchema))
          .get(),
      ),
    );
    return snaps.flatMap((snap) => snap.docs.map((doc) => doc.data()));
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
      .flatMap(({ children }) => children.map((c) => c.contribution.userId))
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
    children
      .map((c) => c.contribution.userId)
      .filter((id): id is string => !!id) ?? [];

  const uniqueUserIds = [...new Set(contributorIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

  return {
    preem,
    children,
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

    const db = await getFirestore();
    const seriesSnap = await db
      .collection('series')
      .where('organizationId', '==', organization.id)
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

export const getRenderableHomeDataForPage = cache(async () => {
  const db = await getFirestore();
  const now = new Date();
  const nowTs = Timestamp.fromDate(now);

  // Fetch upcoming events
  const eventsSnap = await db
    .collection('events')
    .where('startDate', '>=', nowTs)
    .orderBy('startDate', 'asc')
    .withConverter(converter(EventSchema))
    .get();

  // Fetch upcoming races (needed for preems without s)
  const preemsSnap = await db
    .collection('preems')
    .where('timeLimit', '>=', nowTs) // Approximation since we don't have race.startDate
    .orderBy('timeLimit', 'asc')
    .withConverter(converter(PreemSchema))
    .get();
  const preems = preemsSnap.docs.map((doc) => doc.data());

  const contributionsSnap = await db
    .collection('contributions')
    .withConverter(converter(ContributionSchema))
    .orderBy('date', 'desc')
    .limit(20)
    .get();
  const contributionsList = contributionsSnap.docs.map((doc) => doc.data());

  const userIds = contributionsList
    .map((c) => c.userId)
    .filter((id): id is string => !!id);
  const uniqueUserIds = [...new Set(userIds)];
  const users =
    uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];
  const usersMap = users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  );

  const contributions: ContributionWithUser[] = contributionsList.map((c) => ({
    contribution: c,
    contributor: c.userId ? usersMap[c.userId] : undefined,
  }));

  const eventsWithRaces = await Promise.all(
    eventsSnap.docs.map(getRacesForEvent),
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
    .collection('contributions')
    .where('userId', '==', docId(path))
    .withConverter(converter(ContributionSchema))
    .get();

  const contributions = contributionsSnap.docs.map((doc) =>
    doc.data(),
  ) as Contribution[];

  const preemIds = [
    ...new Set(contributions.map((c) => c.preemId).filter(Boolean)),
  ] as string[];
  const preemsSnap =
    preemIds.length > 0
      ? await db
          .collection('preems')
          .where('id', 'in', preemIds)
          .withConverter(converter(PreemSchema))
          .get()
      : null;
  const preemsList = preemsSnap ? preemsSnap.docs.map((doc) => doc.data()) : [];
  const preemsMap = preemsList.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<string, Preem>,
  );

  const raceIds = [
    ...new Set(preemsList.map((p) => p.raceId).filter(Boolean)),
  ] as string[];
  const racesSnap =
    raceIds.length > 0
      ? await db
          .collection('races')
          .where('id', 'in', raceIds)
          .withConverter(converter(RaceSchema))
          .get()
      : null;
  const racesList = racesSnap ? racesSnap.docs.map((doc) => doc.data()) : [];
  const racesMap = racesList.reduce(
    (acc, r) => {
      acc[r.id] = r;
      return acc;
    },
    {} as Record<string, Race>,
  );

  const contributionsWithDetails = contributions.map((c) => {
    const preem = c.preemId ? preemsMap[c.preemId] : undefined;
    const race = preem?.raceId ? racesMap[preem.raceId] : undefined;
    return { contribution: c, preem, race };
  });

  const organizationIds =
    user.organizationRefs?.map((ref) => ref.id).filter((id) => !!id) ?? [];
  const organizations =
    organizationIds.length > 0
      ? await getOrganizationsByIds(organizationIds)
      : [];

  return {
    user,
    contributions: contributionsWithDetails,
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
    const raceWithPreems = await getRenderableRaceDataForPage(
      `races/${raceId}`,
    );
    if (!raceWithPreems) {
      notFound('Race not found');
    }

    const contributorIds =
      raceWithPreems.children
        ?.flatMap(({ children }) => children.map((c) => c.contribution.userId))
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
    const racesSnap = await db
      .collection('races')
      .where('eventId', '==', eventId)
      .withConverter(converter(RaceSchema))
      .get();
    return racesSnap.docs.map((doc) => doc.data());
  },
);

export const getPreemsForRaceId = cache(
  async (raceId: string): Promise<Preem[]> => {
    const db = await getFirestore();
    const preemsSnap = await db
      .collection('preems')
      .where('raceId', '==', raceId)
      .withConverter(converter(PreemSchema))
      .get();
    return preemsSnap.docs.map((doc) => doc.data());
  },
);

export const getContributionsForPreemId = cache(
  async (preemId: string): Promise<Contribution[]> => {
    const db = await getFirestore();
    const contributionsSnap = await db
      .collection('contributions')
      .where('preemId', '==', preemId)
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
