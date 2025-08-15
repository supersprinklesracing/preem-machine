'use client';

import RaceCard from '@/components/RaceCard';
import type { Contribution, Event, Race, User } from '@/datastore/types';
import { Button, Flex, Grid, Stack, Title } from '@mantine/core';
import Link from 'next/link';
import LiveContributionFeed from '../shared/LiveContributionFeed';

interface HomeProps {
  eventsWithRaces: { event: Event; race: Race }[];
  users: User[];
  contributions: (Contribution & {
    preemName: string;
    raceName: string;
    raceId: string;
    preemId: string;
  })[];
}

export default function Home({
  eventsWithRaces,
  users,
  contributions,
}: HomeProps) {
  return (
    <Stack>
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Upcoming Races
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {eventsWithRaces.map(({ event, race }) => (
              <RaceCard key={race.id} race={race} event={event}>
                <Flex mt="md" gap="md" wrap="wrap">
                  <Button
                    component={Link}
                    href={`/race/${race.id}`}
                    variant="outline"
                    style={{ flexGrow: 1, minWidth: '120px' }}
                  >
                    Contribute
                  </Button>
                  <Button
                    component={Link}
                    href={`/race/${race.id}`}
                    variant="default"
                    style={{ flexGrow: 1, minWidth: '120px' }}
                  >
                    View Race
                  </Button>
                </Flex>
              </RaceCard>
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
