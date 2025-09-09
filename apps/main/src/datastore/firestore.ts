import 'server-only';

import { getFirestore } from '@/firebase-admin';
import { docId, DocPath } from './paths';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { cache } from 'react';
import { clientConverter } from './converters';
import type {
  ClientCompat,
  Contribution,
  Event,
  Organization,
  Preem,
  Race,
  Series,
  User,
} from './types';
import { notFound } from './errors';

export interface PreemWithContributions {
  preem: ClientCompat<Preem>;
  children: ClientCompat<Contribution>[];
}
export interface RaceWithPreems {
  race: ClientCompat<Race>;
  children: PreemWithContributions[];
}
export interface EventWithRaces {
  event: ClientCompat<Event>;
  children: RaceWithPreems[];
}
export interface SeriesWithEvents {
  series: ClientCompat<Series>;
  children: EventWithRaces[];
}
export interface OrganizationWithSeries {
  organization: ClientCompat<Organization>;
  children: SeriesWithEvents[];
}

const _getDocSnap = async <T>(
  path: string,
): Promise<DocumentSnapshot<ClientCompat<T>>> => {
  const db = await getFirestore();

  // The converter now correctly receives the base type `T`
  // and will return the expected `ClientCompat<T>`.
  return await db.doc(path).withConverter(clientConverter<T>()).get();
};
export const getDocSnap = cache(_getDocSnap);

const _getDoc = async <T>(path: string): Promise<ClientCompat<T>> => {
  const data = (await getDocSnap<T>(path)).data();
  if (!data) {
    notFound('Doc not found');
  }
  return data;
};
export const getDoc = cache(_getDoc);

const getPreemWithContributions = async (
  preemDoc: DocumentSnapshot<ClientCompat<Preem>>,
): Promise<PreemWithContributions> => {
  const preem = preemDoc.data();
  if (!preem) {
    notFound('Preem not found');
  }
  const contributionsSnap = await preemDoc.ref
    .collection('contributions')
    .withConverter(clientConverter<Contribution>())
    .get();
  return {
    preem,
    children: contributionsSnap.docs.map((doc) => doc.data()),
  };
};

const getRaceWithPreems = async (
  raceDoc: DocumentSnapshot<ClientCompat<Race>>,
): Promise<RaceWithPreems> => {
  const result: RaceWithPreems = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    race: raceDoc.data()!,
    children: [],
  };
  const snap = await raceDoc.ref
    .collection('preems')
    .withConverter(clientConverter<Preem>())
    .get();
  for (const doc of snap.docs) {
    result.children.push(await getPreemWithContributions(doc));
  }
  return result;
};

const getRacesForEvent = async (
  eventDoc: DocumentSnapshot<ClientCompat<Event>>,
): Promise<EventWithRaces> => {
  const result: EventWithRaces = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event: eventDoc.data()!,
    children: [],
  };
  const snap = await eventDoc.ref
    .collection('races')
    .withConverter(clientConverter<Race>())
    .get();
  for (const doc of snap.docs) {
    result.children.push(await getRaceWithPreems(doc));
  }
  return result;
};

const getEventsForSeries = async (
  seriesDoc: DocumentSnapshot<ClientCompat<Series>>,
): Promise<SeriesWithEvents> => {
  const result: SeriesWithEvents = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    series: seriesDoc.data()!,
    children: [],
  };
  const snap = await seriesDoc.ref
    .collection('events')
    .withConverter(clientConverter<Event>())
    .get();
  for (const doc of snap.docs) {
    result.children.push(await getRacesForEvent(doc));
  }
  return result;
};

export const getSeriesForOrganization = async (
  organizationDoc: DocumentSnapshot<ClientCompat<Organization>>,
): Promise<SeriesWithEvents[]> => {
  const snap = await organizationDoc.ref
    .collection('series')
    .withConverter(clientConverter<Series>())
    .get();
  return Promise.all(snap.docs.map(getEventsForSeries));
};

export const getOrganizationWithSeries = async (
  organizationDoc: DocumentSnapshot<ClientCompat<Organization>>,
): Promise<OrganizationWithSeries> => {
  const result: OrganizationWithSeries = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    organization: organizationDoc.data()!,
    children: [],
  };
  result.children = await getSeriesForOrganization(organizationDoc);
  return result;
};

export const getUsers = cache(async () => {
  const db = await getFirestore();
  const usersSnap = await db
    .collection('users')
    .withConverter(clientConverter<User>())
    .get();
  return usersSnap.docs.map((doc) => doc.data());
});

export const getUserById = cache(
  async (id: string): Promise<ClientCompat<User>> => {
    const db = await getFirestore();
    const docSnap = await db
      .collection('users')
      .doc(id)
      .withConverter(clientConverter<User>())
      .get();
    if (!docSnap.exists) {
      notFound('User doc not found: ' + id);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return docSnap.data()!;
  },
);

export const getOrganizationByStripeConnectAccountId = async (
  accountId: string,
) => {
  const db = await getFirestore();
  const orgsSnap = await db
    .collection('organizations')
    .where('stripe.connectAccountId', '==', accountId)
    .withConverter(clientConverter<Organization>())
    .limit(1)
    .get();

  if (orgsSnap.empty) {
    notFound('Organization not found.');
  }
  return orgsSnap.docs[0];
};

export const getUsersByIds = cache(
  async (ids: string[]): Promise<ClientCompat<User>[]> => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return [];
    }
    const db = await getFirestore();
    const usersSnap = await db
      .collection('users')
      .where('id', 'in', uniqueIds)
      .withConverter(clientConverter<User>())
      .get();
    return usersSnap.docs.map((doc) => doc.data());
  },
);

export const getEventsForOrganizations = cache(
  async (organizationIds: string[]): Promise<ClientCompat<Event>[]> => {
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
      .withConverter(clientConverter<Event>())
      .get();
    return eventsSnap.docs.map((doc) => doc.data());
  },
);

export const getEventsForUser = cache(
  async (userId: string): Promise<ClientCompat<Event>[]> => {
    const user = await getUserById(userId);
    const organizationIds =
      user?.organizationRefs?.map((ref) => ref.id).filter((id) => !!id) ?? [];
    return getEventsForOrganizations(organizationIds);
  },
);

export const getRenderablePreemDataForPage = cache(async (path: DocPath) => {
  const preemDocSnap = await getDocSnap<Preem>(path);
  if (!preemDocSnap.exists) {
    notFound('Preem not found');
  }

  return await getPreemWithContributions(preemDocSnap);
});

export const getRenderableRaceDataForPage = cache(async (path: DocPath) => {
  const raceSnap = await getDocSnap<Race>(path);
  if (!raceSnap.exists) {
    notFound('Race not found');
  }

  return await getRaceWithPreems(raceSnap);
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
    const orgDoc = await getDocSnap<Organization>(path);
    if (!orgDoc.exists) {
      notFound('Org not found');
    }

    const organization = orgDoc.data();
    if (!organization) {
      notFound('Org not found');
    }

    const seriesSnap = await orgDoc.ref
      .collection('series')
      .withConverter(clientConverter<Series>())
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
  const seriesSnap = await getDocSnap<Series>(path);
  if (!seriesSnap.exists) {
    notFound('Series not found');
  }

  return await getEventsForSeries(seriesSnap);
});

export const getRenderableEventDataForPage = cache(async (path: DocPath) => {
  const eventSnap = await getDocSnap<Event>(path);
  if (!eventSnap.exists) {
    notFound('Event not found');
  }
  return await getRacesForEvent(eventSnap);
});

export const getRenderableHomeDataForPage = cache(async () => {
  const db = await getFirestore();

  // Fetch upcoming events
  const now = new Date();
  const eventsSnap = await db
    .collectionGroup('events')
    .where('startDate', '>=', now)
    .orderBy('startDate', 'asc')
    .withConverter(clientConverter<Event>())
    .get();
  const contributionsSnap = await db
    .collectionGroup('contributions')
    .withConverter(clientConverter<Contribution>())
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
            .withConverter(clientConverter<Preem>())
            .get()
        ).docs.map((d) => d.data())
      : [];

  const preemsMap = preems.reduce(
    (acc, preem) => {
      acc[preem.id] = preem;
      return acc;
    },
    {} as Record<string, ClientCompat<Preem>>,
  );

  const contributions = recentContributionsRaw.map((c) => {
    const fullPreem = c.preemBrief?.id ? preemsMap[c.preemBrief.id] : undefined;
    return {
      ...c,
      preemBrief: fullPreem,
    } as ClientCompat<Contribution>;
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
  const db = await getFirestore();
  const user = await getDoc<User>(path);
  if (!user) {
    notFound('User doc not found: ' + path);
  }

  const contributionsSnap = await db
    .collectionGroup('contributions')
    .where('contributor.id', '==', docId(path))
    .withConverter(clientConverter<Contribution>())
    .get();

  const contributions = contributionsSnap.docs.map((doc) => doc.data());

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
    race: ClientCompat<RaceWithPreems>;
    users: ClientCompat<User>[];
  }> => {
    const { race, children } = await getRenderableRaceDataForPage(raceId);
    if (!race) {
      notFound('Race not found');
    }

    const contributorIds =
      children
        ?.flatMap(({ children }) => children.map((c) => c.contributor?.id))
        .filter((id): id is string => !!id) ?? [];

    const uniqueUserIds = [...new Set(contributorIds)];
    const users =
      uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

    return {
      race: race as ClientCompat<RaceWithPreems>,
      users: users as ClientCompat<User>[],
    };
  },
);

export const getRacesForEventId = cache(
  async (eventId: string): Promise<ClientCompat<Race>[]> => {
    const db = await getFirestore();
    const eventSnap = await db
      .collectionGroup('events')
      .where('id', '==', eventId)
      .limit(1)
      .get();
    if (eventSnap.empty) {
      return [];
    }
    const racesSnap = await eventSnap.docs[0].ref
      .collection('races')
      .withConverter(clientConverter<Race>())
      .get();
    return racesSnap.docs.map((doc) => doc.data());
  },
);

export const getPreemsForRaceId = cache(
  async (raceId: string): Promise<ClientCompat<Preem>[]> => {
    const db = await getFirestore();
    const raceSnap = await db
      .collectionGroup('races')
      .where('id', '==', raceId)
      .limit(1)
      .get();
    if (raceSnap.empty) {
      return [];
    }
    const preemsSnap = await raceSnap.docs[0].ref
      .collection('preems')
      .withConverter(clientConverter<Preem>())
      .get();
    return preemsSnap.docs.map((doc) => doc.data());
  },
);

export const getContributionsForPreemId = cache(
  async (preemId: string): Promise<ClientCompat<Contribution>[]> => {
    const db = await getFirestore();
    const preemSnap = await db
      .collectionGroup('preems')
      .where('id', '==', preemId)
      .limit(1)
      .get();
    if (preemSnap.empty) {
      return [];
    }
    const contributionsSnap = await preemSnap.docs[0].ref
      .collection('contributions')
      .withConverter(clientConverter<Contribution>())
      .get();
    return contributionsSnap.docs.map((doc) => doc.data());
  },
);

export const getOrganizationFromPath = cache(async (path: string) => {
  const pathParts = path.split('/');
  if (pathParts.length < 2 || pathParts[0] !== 'organizations') {
    notFound(`Invalid path for getting organization: ${path}`);
  }
  return getDoc<Organization>(`organizations/${pathParts[1]}`);
});
