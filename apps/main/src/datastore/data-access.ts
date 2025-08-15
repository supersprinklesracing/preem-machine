import 'server-only';

import { organizations, raceSeries, users } from '@/datastore/mock-data';
import { cache } from 'react';
import type {
  Contribution,
  Event,
  Organization,
  Preem,
  Race,
  RaceSeries,
  User,
} from './types';

// --- Query Reponse custom types. ---

export interface EnrichedEvent extends Event {
  totalCollected: number;
  totalContributors: number;
}

export type EnrichedSeries = Omit<RaceSeries, 'events'> & {
  events: EnrichedEvent[];
};

// --- User Functions ---

export const getUsers = cache(async (): Promise<User[]> => {
  console.log('Fetching all users');
  return users;
});

export const getUserById = cache(
  async (id: string | undefined): Promise<User | undefined> => {
    console.log(`Fetching user by id: ${id}`);
    return users.find((u) => u.id === id);
  }
);

export const getUsersByIds = cache(async (ids: string[]): Promise<User[]> => {
  console.log(`Fetching users by ids: ${[...new Set(ids)].join(', ')}`);
  const uniqueIds = [...new Set(ids)];
  return users.filter((u) => uniqueIds.includes(u.id));
});

// --- Organization Functions ---

export const getOrganizations = cache(async (): Promise<Organization[]> => {
  console.log('Fetching all organizations');
  return organizations;
});

export const getOrganizationsForUser = cache(
  async (userId: string): Promise<Organization[]> => {
    console.log(`Fetching organizations for user: ${userId}`);
    const user = await getUserById(userId);
    if (!user?.organizationMemberships) return [];
    const orgIds = user.organizationMemberships.map((m) => m.organizationId);
    return organizations.filter((o) => orgIds.includes(o.id));
  }
);

export const getUsersByOrganizationId = cache(
  async (organizationId: string): Promise<User[]> => {
    console.log(`Fetching users for organization: ${organizationId}`);
    return users.filter((u) =>
      u.organizationMemberships?.some(
        (m) => m.organizationId === organizationId
      )
    );
  }
);

export const getOrganizationById = cache(
  async (id: string): Promise<Organization | undefined> => {
    console.log(`Fetching organization by id: ${id}`);
    return organizations.find((o) => o.id === id);
  }
);

export const getOrganizationBySeriesId = cache(
  async (seriesId: string): Promise<Organization | undefined> => {
    console.log(`Fetching organization for series: ${seriesId}`);
    const series = await getRaceSeriesById(seriesId);
    if (!series) return undefined;
    return organizations.find((o) => o.id === series.organizationId);
  }
);

// --- Race & Series Functions ---

export const getRaceSeriesById = cache(
  async (id: string): Promise<RaceSeries | undefined> => {
    console.log(`Fetching race series by id: ${id}`);
    const series = raceSeries.find((rs) => rs.id === id);
    if (!series) return undefined;

    // Enrich events with totals
    const enrichedEvents = series.events.map((event) => {
      const totalCollected = event.races.reduce(
        (raceSum, race) =>
          raceSum +
          race.preems.reduce(
            (preemSum, preem) => preemSum + preem.prizePool,
            0
          ),
        0
      );

      const totalContributors = new Set(
        event.races.flatMap((race) =>
          race.preems.flatMap((preem) =>
            preem.contributionHistory
              .map((c) => c.contributorId)
              .filter(Boolean)
          )
        )
      ).size;

      return { ...event, totalCollected, totalContributors };
    });

    return { ...series, events: enrichedEvents };
  }
);

export const getSeriesByEventId = cache(
  async (eventId: string): Promise<RaceSeries | undefined> => {
    console.log(`Fetching series for event: ${eventId}`);
    const event = await getEventById(eventId);
    if (!event) return undefined;
    return raceSeries.find((rs) => rs.id === event.seriesId);
  }
);

export const getEventById = cache(
  async (id: string): Promise<Event | undefined> => {
    console.log(`Fetching event by id: ${id}`);
    return raceSeries
      .flatMap((series) => series.events)
      .find((e) => e.id === id);
  }
);

export const getRaceSeriesForOrganization = cache(
  async (organizationId: string): Promise<RaceSeries[]> => {
    console.log(`Fetching race series for organization: ${organizationId}`);
    return raceSeries.filter((rs) => rs.organizationId === organizationId);
  }
);

export const getEnrichedRaceSeriesForOrganization = cache(
  async (organizationId: string): Promise<EnrichedSeries[]> => {
    console.log(
      `Fetching enriched race series for organization: ${organizationId}`
    );
    const seriesForOrg = raceSeries.filter(
      (rs) => rs.organizationId === organizationId
    );

    const enrichEvent = (event: Event): EnrichedEvent => {
      const totalCollected = event.races.reduce(
        (raceSum, race) =>
          raceSum +
          race.preems.reduce(
            (preemSum, preem) => preemSum + preem.prizePool,
            0
          ),
        0
      );

      const totalContributors = new Set(
        event.races.flatMap((race) =>
          race.preems.flatMap((preem) =>
            preem.contributionHistory
              .map((c) => c.contributorId)
              .filter(Boolean)
          )
        )
      ).size;

      return { ...event, totalCollected, totalContributors };
    };

    return seriesForOrg.map((series) => ({
      ...series,
      events: series.events.map(enrichEvent),
    }));
  }
);

export const getRaceById = cache(async (id: string) => {
  console.log(`Fetching race by id: ${id}`);
  return raceSeries
    .flatMap((series) => series.events)
    .flatMap((event) => event.races)
    .find((r) => r.id === id);
});

export const getAllRaces = cache(async (): Promise<Race[]> => {
  console.log('Fetching all races');
  return raceSeries
    .flatMap((series) => series.events)
    .flatMap((event) => event.races);
});

export const getEventsWithRaces = cache(
  async (): Promise<{ event: Event; race: Race }[]> => {
    console.log('Fetching events with races');
    return raceSeries
      .flatMap((series) => series.events)
      .flatMap((event) => event.races.map((race) => ({ event, race })));
  }
);

// --- Preem & Contribution Functions ---

export const getPreemsForRace = cache(
  async (raceId: string): Promise<Preem[]> => {
    console.log(`Fetching preems for race: ${raceId}`);
    const race = await getRaceById(raceId);
    return race?.preems ?? [];
  }
);

type ContributionWithMeta = Contribution & {
  raceName: string;
  preemName: string;
};

export const getContributionsForUser = cache(
  async (userId: string): Promise<ContributionWithMeta[]> => {
    console.log(`Fetching contributions for user: ${userId}`);
    return raceSeries
      .flatMap((series) => series.events)
      .flatMap((event) => event.races)
      .flatMap((race) =>
        race.preems.flatMap((preem) =>
          preem.contributionHistory
            .filter((c) => c.contributorId === userId)
            .map((c) => ({
              ...c,
              raceName: race.name,
              preemName: preem.name,
            }))
        )
      );
  }
);

export const getPreemAndRaceById = cache(async (id: string) => {
  console.log(`Fetching preem and race by id: ${id}`);
  for (const series of raceSeries) {
    for (const event of series.events) {
      for (const race of event.races) {
        const preem = race.preems.find((p) => p.id === id);
        if (preem) return { preem, race };
      }
    }
  }
  return undefined;
});

export const getEventAndRaceById = cache(async (id: string) => {
  console.log(`Fetching event and race by id: ${id}`);
  for (const series of raceSeries) {
    for (const event of series.events) {
      const race = event.races.find((r) => r.id === id);
      if (race) return { event, race };
    }
  }
  return undefined;
});
