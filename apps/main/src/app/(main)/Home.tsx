'use client';

import { Grid, Title, Stack } from '@mantine/core';
import type { Race, User, Contribution } from '@/datastore/types';
import RaceCard from '@/components/RaceCard';
import LiveContributionFeed from '../shared/LiveContributionFeed';

interface HomeProps {
  races: Race[];
  users: User[];
  contributions: (Contribution & {
    preemName: string;
    raceName: string;
    raceId: string;
  })[];
}

export default function Home({ races, users, contributions }: HomeProps) {
  return (
    <Stack>
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Upcoming Races
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {races.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <LiveContributionFeed contributions={contributions} users={users} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
