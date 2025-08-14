import { cache } from 'react';
import 'server-only';
import { raceSeries, users } from '@/datastore/mock-data';
import type { Contribution, Preem, RaceSeries, User } from './types';

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

// --- Race & Series Functions ---

export const getRaceSeriesForOrganizer = cache(
  async (organizerId: string): Promise<RaceSeries[]> => {
    console.log(`Fetching race series for organizer: ${organizerId}`);
    return raceSeries.filter((rs) => rs.organizerId === organizerId);
  }
);

export const getRaceById = cache(async (id: string) => {
  console.log(`Fetching race by id: ${id}`);
  return raceSeries.flatMap((series) => series.races).find((r) => r.id === id);
});

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
    return raceSeries.flatMap((series) =>
      series.races.flatMap((race) =>
        race.preems.flatMap((preem) =>
          preem.contributionHistory
            .filter((c) => c.contributorId === userId)
            .map((c) => ({
              ...c,
              raceName: race.name,
              preemName: preem.name,
            }))
        )
      )
    );
  }
);

export const getPreemAndRaceById = cache(async (id: string) => {
  console.log(`Fetching preem and race by id: ${id}`);
  for (const series of raceSeries) {
    for (const race of series.races) {
      const preem = race.preems.find((p) => p.id === id);
      if (preem) return { preem, race };
    }
  }
  return undefined;
});
