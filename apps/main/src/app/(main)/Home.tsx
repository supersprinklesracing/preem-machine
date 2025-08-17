'use client';

import RaceCard from '@/components/RaceCard';
import type { Contribution, ClientCompat, Race } from '@/datastore/types';
import { Button, Flex, Grid, Stack, Title } from '@mantine/core';
import Link from 'next/link';
import LiveContributionFeed from '../shared/LiveContributionFeed';

export interface HomePageData {
  recentRaces: ClientCompat<Race>[];
  contributions: ClientCompat<Contribution>[];
}

interface Props {
  data: HomePageData;
}

export default function Home({ data }: Props) {
  const { recentRaces, contributions: contributions } = data;
  return (
    <Stack>
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Upcoming Races
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {recentRaces.map((race) => (
              <RaceCard key={race.id} race={race}>
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
          <LiveContributionFeed data={{ contributions: contributions }} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
