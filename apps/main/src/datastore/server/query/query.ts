import 'server-only';

import { getFirestore } from '@/firebase/server';
import { type DocumentSnapshot } from 'firebase-admin/firestore';
import { cache } from 'react';
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

const getPreemWithContributions = async (
  preemDoc: DocumentSnapshot<Preem>,
): Promise<PreemWithContributions> => {
  const preem = preemDoc.data();
  if (!preem) {
    notFound('Preem not found');
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
  for (const doc of snap.docs) {
    result.children.push(await getPreemWithContributions(doc));
  }
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
  for (const doc of snap.docs) {
    result.children.push(await getRaceWithPreems(doc));
  }
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
  for (const doc of snap.docs) {
    result.children.push(await getRacesForEvent(doc));
  }
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
    // TODO: This should just be one day.
    oneDayAgo.setDate(oneDayAgo.getDate() - 365);

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
    console.log('Getting events for user', userId);
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
    notFound('Preem not found');
  }

  return await getPreemWithContributions(doc);
});

export const getRenderableRaceDataForPage = cache(async (path: DocPath) => {
  const raceSnap = await getDocRefInternal(RaceSchema, path);
  const doc = await raceSnap.get();
  if (!doc.exists) {
    notFound('Race not found');
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

export const getRenderableOrganizationDataForPage = cache(
  async (path: DocPath) => {
    const orgDoc = await getDocRefInternal(OrganizationSchema, path);
    const doc = await orgDoc.get();
    if (!doc.exists) {
      notFound('Org not found');
    }

    const organization = doc.data();
    if (!organization) {
      notFound('Org not found');
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
    notFound('Series not found');
  }

  return await getEventsForSeries(doc);
});

export const getRenderableEventDataForPage = cache(async (path: DocPath) => {
  const eventSnap = await getDocRefInternal(EventSchema, path);
  const doc = await eventSnap.get();
  if (!doc.exists) {
    notFound('Event not found');
  }
  return await getRacesForEvent(doc);
});

export const getRenderableHomeDataForPage = cache(async () => {
  const db = await getFirestore();

  // Fetch upcoming events
  const now = new Date();
  const eventsSnap = await db
    .collectionGroup('events')
    .where('startDate', '>=', now)
    .orderBy('startDate', 'asc')
    .withConverter(converter(EventSchema))
    .get();
  const contributionsSnap = await db
    .collectionGroup('contributions')
    .withConverter(converter(ContributionSchema))
    .orderBy('date', 'desc')
    .limit(20)
    .get();
  const recentContributionsRaw = contributionsSnap.docs.map((doc) =>
    doc.data(),
  );

  const preemIds = [
    ...new Set(
      recentContributionsRaw
        .map((c) => c.preemBrief?.id)
        .filter((id): id is string => !!id),
    ),
  ];

  const preems =
    preemIds.length > 0
      ? (
          await db
            .collectionGroup('preems')
            .where('id', 'in', preemIds)
            .withConverter(converter(PreemSchema))
            .get()
        ).docs.map((d) => d.data())
      : [];

  const preemsMap = preems.reduce(
    (acc, preem) => {
      acc[preem.id] = preem;
      return acc;
    },
    {} as Record<string, Preem>,
  );

  const contributions = recentContributionsRaw.map((c) => {
    const fullPreem = c.preemBrief?.id ? preemsMap[c.preemBrief.id] : undefined;
    return {
      ...c,
      preemBrief: fullPreem,
    } as Contribution;
  });

  const eventsWithRaces = await Promise.all(
    eventsSnap.docs.map(getRacesForEvent),
  );

  return {
    eventsWithRaces,
    contributions,
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

  return {
    user,
    contributions,
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
