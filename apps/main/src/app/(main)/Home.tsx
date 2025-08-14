'use client';

import { Grid, Title, Stack } from '@mantine/core';
import type { Race } from '@/datastore/types';
import RaceCard from '@/components/RaceCard';

interface HomeProps {
  races: Race[];
}

export default function Home({ races }: HomeProps) {
  return (
    <Stack>
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Upcoming Races
      </Title>
      <Grid>
        {races.map((race) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={race.id}>
            <RaceCard race={race} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
