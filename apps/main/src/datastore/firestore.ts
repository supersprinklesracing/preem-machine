import 'server-only';

import { getFirestore } from '@/firebase-admin';
import type { firestore } from 'firebase-admin';
import { cache } from 'react';
import type { AdminPageData } from '../app/(main)/admin/Admin';
import type { HomePageData } from '../app/(main)/Home';
import type { HubPageData } from '../app/(main)/manage/(live)/Hub';
import type { OrganizationPageData } from '../app/(main)/organization/[id]/Organization';
import type { PreemPageData } from '../app/(main)/preem/[id]/Preem';
import type { RacePageData } from '../app/(main)/race/[id]/Race';
import type { SeriesPageData } from '../app/(main)/series/[id]/Series';
import type { UserPageData } from '../app/(main)/user/[[...id]]/User';
import { getAuthUserFromCookies } from '../auth/user';
import { genericConverter } from './converters';
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

export type RaceWithPreems = ClientCompat<
  Race & {
    preems: PreemWithContributions[];
  }
>;
export type EventWithRaces = ClientCompat<Event & { races: RaceWithPreems[] }>;
export type SeriesWithEvents = ClientCompat<
  Series & { events: EventWithRaces[] }
>;
export type PreemWithContributions = ClientCompat<
  Preem & {
    contributions: Contribution[];
  }
>;

const getContributionsForPreem = async (
  preemDoc: firestore.QueryDocumentSnapshot<ClientCompat<Preem>>
): Promise<PreemWithContributions> => {
  const preem = preemDoc.data();
  const contributionsSnap = await preemDoc.ref
    .collection('contributions')
    .withConverter(genericConverter<Contribution>())
    .get();
  const contributions = contributionsSnap.docs.map((doc) => doc.data());
  return { ...preem, contributions };
};

const getPreemsForRace = async (
  raceDoc: firestore.QueryDocumentSnapshot<ClientCompat<Race>>
): Promise<RaceWithPreems> => {
  const race = raceDoc.data();
  const preemsSnap = await raceDoc.ref
    .collection('preems')
    .withConverter(genericConverter<Preem>())
    .get();
  const preems = await Promise.all(
    preemsSnap.docs.map(getContributionsForPreem)
  );
  return { ...race, preems };
};

const getRacesForEvent = async (
  eventDoc: firestore.QueryDocumentSnapshot<ClientCompat<Event>>
): Promise<EventWithRaces> => {
  const event = eventDoc.data();
  const racesSnap = await eventDoc.ref
    .collection('races')
    .withConverter(genericConverter<Race>())
    .get();
  const races = await Promise.all(racesSnap.docs.map(getPreemsForRace));
  return { ...event, races };
};

const getEventsForSeries = async (
  seriesDoc: firestore.QueryDocumentSnapshot<ClientCompat<Series>>
): Promise<ClientCompat<SeriesWithEvents>> => {
  const series = seriesDoc.data();
  const eventsSnap = await seriesDoc.ref
    .collection('events')
    .withConverter(genericConverter<ClientCompat<Event>>())
    .get();
  const events = await Promise.all(eventsSnap.docs.map(getRacesForEvent));
  return { ...series, events };
};

export const getUsers = cache(async (): Promise<ClientCompat<User>[]> => {
  const db = await getFirestore();
  const usersSnap = await db
    .collection('users')
    .withConverter(genericConverter<User>())
    .get();
  return usersSnap.docs.map((doc) => doc.data());
});

export const getUserById = cache(
  async (id: string | undefined): Promise<ClientCompat<User> | undefined> => {
    if (!id) {
      return undefined;
    }
    const db = await getFirestore();
    const docSnap = await db
      .collection('users')
      .doc(id)
      .withConverter(genericConverter<User>())
      .get();
    return docSnap.data();
  }
);

export const getOrganizationById = cache(
  async (id: string): Promise<ClientCompat<Organization> | undefined> => {
    const db = await getFirestore();
    const docSnap = await db
      .collection('organizations')
      .doc(id)
      .withConverter(genericConverter<Organization>())
      .get();
    return docSnap.data();
  }
);

export const getSeriesById = cache(
  async (id: string): Promise<ClientCompat<Series> | undefined> => {
    const db = await getFirestore();
    const seriesSnap = await db
      .collectionGroup('series')
      .where('id', '==', id)
      .withConverter(genericConverter<Series>())
      .limit(1)
      .get();
    if (seriesSnap.empty) {
      return undefined;
    }
    return seriesSnap.docs[0].data();
  }
);

export const getEventById = cache(
  async (id: string): Promise<ClientCompat<Event> | undefined> => {
    const db = await getFirestore();
    const eventSnap = await db
      .collectionGroup('events')
      .where('id', '==', id)
      .withConverter(genericConverter<Event>())
      .limit(1)
      .get();
    if (eventSnap.empty) {
      return undefined;
    }
    return eventSnap.docs[0].data();
  }
);

export const getOrganizationByStripeConnectAccountId = async (
  accountId: string
): Promise<
  firestore.QueryDocumentSnapshot<ClientCompat<Organization>> | undefined
> => {
  const db = await getFirestore();
  const orgsSnap = await db
    .collection('organizations')
    .where('stripe.connectAccountId', '==', accountId)
    .withConverter(genericConverter<Organization>())
    .limit(1)
    .get();

  if (orgsSnap.empty) {
    return undefined;
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
      .withConverter(genericConverter<User>())
      .get();
    return usersSnap.docs.map((doc) => doc.data());
  }
);

export const getAllRaces = cache(async (): Promise<ClientCompat<Race>[]> => {
  const db = await getFirestore();
  const racesSnap = await db
    .collectionGroup('races')
    .withConverter(genericConverter<Race>())
    .get();
  return racesSnap.docs.map((doc) => doc.data());
});

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
      .withConverter(genericConverter<Event>())
      .get();
    console.log(
      'Events',
      eventsSnap.docs.map((doc) => doc.data())
    );
    return eventsSnap.docs.map((doc) => doc.data());
  }
);

export const getEventsForUser = cache(
  async (userId: string): Promise<ClientCompat<Event>[]> => {
    console.log('Getting events for user', userId);
    const user = await getUserById(userId);
    console.log('User', user);
    const organizationIds =
      user?.organizationRefs?.map((ref) => ref.id).filter((id) => !!id) ?? [];
    console.log('Organization IDs', organizationIds);
    return getEventsForOrganizations(organizationIds);
  }
);

export const getRenderablePreemDataForPage = cache(
  async (id: string): Promise<PreemPageData | undefined> => {
    const db = await getFirestore();
    const preemSnap = await db
      .collectionGroup('preems')
      .where('id', '==', id)
      .withConverter(genericConverter<Preem>())
      .limit(1)
      .get();
    if (preemSnap.empty) {
      return undefined;
    }

    const preem = await getContributionsForPreem(preemSnap.docs[0]);

    return {
      preem: preem as unknown as PreemPageData['preem'],
    };
  }
);

export const getRenderableRaceDataForPage = cache(
  async (id: string): Promise<RacePageData | undefined> => {
    const db = await getFirestore();
    const raceSnap = await db
      .collectionGroup('races')
      .where('id', '==', id)
      .withConverter(genericConverter<Race>())
      .limit(1)
      .get();
    if (raceSnap.empty) {
      return undefined;
    }

    const race = await getPreemsForRace(raceSnap.docs[0]);

    return {
      race: race as unknown as RacePageData['race'],
    };
  }
);

export const getRacePageDataWithUsers = cache(
  async (
    id: string
  ): Promise<
    { race: RaceWithPreems; users: ClientCompat<User>[] } | undefined
  > => {
    const raceData = await getRenderableRaceDataForPage(id);
    if (!raceData) {
      return undefined;
    }
    const { race } = raceData;

    const contributorIds =
      race.preems
        ?.flatMap((p) => p.contributions?.map((c) => c.contributor?.id))
        .filter((id): id is string => !!id) ?? [];

    const uniqueUserIds = [...new Set(contributorIds)];
    const users =
      uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

    return {
      race: race as RaceWithPreems,
      users: users as ClientCompat<User>[],
    };
  }
);

export const getRenderableOrganizationDataForPage = cache(
  async (id: string): Promise<OrganizationPageData | undefined> => {
    const db = await getFirestore();
    const orgDoc = await db
      .collection('organizations')
      .doc(id)
      .withConverter(genericConverter<Organization>())
      .get();
    if (!orgDoc.exists) {
      return undefined;
    }

    const organization = orgDoc.data();
    if (!organization) {
      return undefined;
    }

    const seriesSnap = await orgDoc.ref
      .collection('series')
      .withConverter(genericConverter<Series>())
      .get();
    const series = await Promise.all(seriesSnap.docs.map(getEventsForSeries));

    const memberIds =
      organization.memberRefs
        ?.map((ref) => ref.id)
        .filter((id): id is string => !!id) ?? [];
    const members = memberIds.length > 0 ? await getUsersByIds(memberIds) : [];

    return {
      organization:
        organization as unknown as OrganizationPageData['organization'],
      serieses: series as unknown as OrganizationPageData['serieses'],
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
      .withConverter(genericConverter<Series>())
      .limit(1)
      .get();
    if (seriesSnap.empty) {
      return undefined;
    }

    const series = await getEventsForSeries(seriesSnap.docs[0]);

    return {
      series: series as unknown as SeriesPageData['series'],
    };
  }
);

import type { LiveEventPageData } from '../app/(main)/manage/event/[eventId]/(live)/LiveEvent';
// ...
export const getRenderableEventDataForPage = cache(
  async (id: string): Promise<LiveEventPageData | undefined> => {
    const db = await getFirestore();
    const eventSnap = await db
      .collectionGroup('events')
      .where('id', '==', id)
      .withConverter(genericConverter<Event>())
      .limit(1)
      .get();
    if (eventSnap.empty) {
      return undefined;
    }

    const event = await getRacesForEvent(eventSnap.docs[0]);

    return {
      event: event as unknown as LiveEventPageData['event'],
    };
  }
);

export const getRenderableHomeDataForPage = cache(
  async (): Promise<HomePageData> => {
    const db = await getFirestore();

    // Fetch upcoming events
    const now = new Date();
    const eventsSnap = await db
      .collectionGroup('events')
      .where('startDate', '>=', now)
      .orderBy('startDate', 'asc')
      .withConverter(genericConverter<Event>())
      .get();
    const contributionsSnap = await db
      .collectionGroup('contributions')
      .withConverter(genericConverter<Contribution>())
      .orderBy('date', 'desc')
      .limit(20)
      .get();
    const recentContributionsRaw = contributionsSnap.docs.map((doc) =>
      doc.data()
    );

    const preemIds = [
      ...new Set(
        recentContributionsRaw
          .map((c) => c.preemBrief?.id)
          .filter((id): id is string => !!id)
      ),
    ];

    const preems =
      preemIds.length > 0
        ? (
            await db
              .collectionGroup('preems')
              .where('id', 'in', preemIds)
              .withConverter(genericConverter<ClientCompat<Preem>>())
              .get()
          ).docs.map((d) => d.data())
        : [];

    const preemsMap = preems.reduce((acc, preem) => {
      acc[preem.id] = preem;
      return acc;
    }, {} as Record<string, ClientCompat<Preem>>);

    const recentContributions = recentContributionsRaw.map((c) => {
      const fullPreem = c.preemBrief?.id
        ? preemsMap[c.preemBrief.id]
        : undefined;
      return {
        ...c,
        preemBrief: fullPreem,
      };
    });

    const upcomingEvents = await Promise.all(
      eventsSnap.docs.map(getRacesForEvent)
    );

    return {
      upcomingEvents: upcomingEvents,
      contributions: recentContributions,
    };
  }
);

export const getRenderableUserDataForPage = cache(
  async (id: string): Promise<UserPageData | undefined> => {
    const db = await getFirestore();
    const user = await getUserById(id);
    if (!user) {
      return undefined;
    }

    const contributionsSnap = await db
      .collectionGroup('contributions')
      .where('contributor.id', '==', id)
      .withConverter(genericConverter<Contribution>())
      .get();

    const contributions = contributionsSnap.docs.map((doc) => doc.data());

    return {
      user: user as unknown as UserPageData['user'],
      contributions: contributions as unknown as UserPageData['contributions'],
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

export const anonymousUser = () => ({
  id: undefined,
  name: 'Anonymous',
  avatarUrl: 'https://placehold.co/100x100.png',
});


export const getRaceWithUsers = cache(
  async (
    raceId: string
  ): Promise<
    | { race: ClientCompat<RaceWithPreems>; users: ClientCompat<User>[] }
    | undefined
  > => {
    const raceData = await getRenderableRaceDataForPage(raceId);
    if (!raceData) {
      return undefined;
    }
    const { race } = raceData;

    const contributorIds =
      race.preems
        ?.flatMap((p) => p.contributions?.map((c) => c.contributor?.id))
        .filter((id): id is string => !!id) ?? [];

    const uniqueUserIds = [...new Set(contributorIds)];
    const users =
      uniqueUserIds.length > 0 ? await getUsersByIds(uniqueUserIds) : [];

    return {
      race: race as ClientCompat<RaceWithPreems>,
      users: users as ClientCompat<User>[],
    };
  }
);

export const getSeriesForOrganization = cache(
  async (organizationId: string): Promise<ClientCompat<Series>[]> => {
    const db = await getFirestore();
    const seriesSnap = await db
      .collection(`organizations/${organizationId}/series`)
      .withConverter(genericConverter<Series>())
      .get();
    return seriesSnap.docs.map((doc) => doc.data());
  }
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
      .withConverter(genericConverter<Race>())
      .get();
    return racesSnap.docs.map((doc) => doc.data());
  }
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
      .withConverter(genericConverter<Preem>())
      .get();
    return preemsSnap.docs.map((doc) => doc.data());
  }
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
      .withConverter(genericConverter<Contribution>())
      .get();
    return contributionsSnap.docs.map((doc) => doc.data());
  }
);

export const getOrganizationsForUser = cache(
  async (userId: string): Promise<ClientCompat<Organization>[]> => {
    const user = await getUserById(userId);
    if (!user || !user.organizationRefs) {
      return [];
    }
    const orgs = await Promise.all(
      user.organizationRefs.map((ref) => getOrganizationById(ref.id))
    );
    return orgs.filter((org): org is ClientCompat<Organization> => !!org);
  }
);

export const getHubPageData = cache(
  async (): Promise<HubPageData> => {
    const authUser = await getAuthUserFromCookies();
    if (!authUser) {
      return { organizations: [] };
    }

    const organizations = await getOrganizationsForUser(authUser.id);

    const organizationsWithSeries = await Promise.all(
      organizations.map(async (org) => {
        const serieses = await getSeriesForOrganization(org.id);
        const seriesesWithEvents = await Promise.all(
          serieses.map(async (series) => {
            const seriesDocSnap = await (
              await getFirestore()
            )
              .collection(`organizations/${org.id}/series`)
              .doc(series.id)
              .withConverter(genericConverter<Series>())
              .get();
            if (seriesDocSnap.exists) {
              return getEventsForSeries(
                seriesDocSnap as firestore.QueryDocumentSnapshot<
                  ClientCompat<Series>
                >
              );
            }
            return null;
          })
        );
        return {
          ...org,
          serieses: seriesesWithEvents.filter(
            (s): s is ClientCompat<SeriesWithEvents> => s !== null
          ),
        };
      })
    );

    return { organizations: organizationsWithSeries };
  }
);

export const getOrganizationFromPreemPath = cache(
  async (preemPath: string): Promise<ClientCompat<Organization> | undefined> => {
    const pathParts = preemPath.split('/');
    if (pathParts.length < 2 || pathParts[0] !== 'organizations') {
      console.error('Invalid preem path for getting organization:', preemPath);
      return undefined;
    }
    const organizationId = pathParts[1];
    return getOrganizationById(organizationId);
  }
);