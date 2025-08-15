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

// --- Race & Series Functions ---

export const getRaceSeriesForOrganization = cache(
  async (organizationId: string): Promise<RaceSeries[]> => {
    console.log(`Fetching race series for organization: ${organizationId}`);
    return raceSeries.filter((rs) => rs.organizationId === organizationId);
  }
);

export const getRaceById = cache(async (id: string) => {
  console.log(`Fetching race by id: ${id}`);
  return raceSeries
    .flatMap((series) => series.events)
    .flatMap((event) => event.races)
    .find((r) => r.id === id);
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
