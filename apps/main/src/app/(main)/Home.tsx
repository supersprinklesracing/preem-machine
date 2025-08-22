'use client';

import { EventWithRaces } from '@/datastore/firestore';
import type { ClientCompat, Contribution } from '@/datastore/types';
import { Card, Grid, Stack, Text, Title } from '@mantine/core';
import { format } from 'date-fns';
import Link from 'next/link';
import LiveContributionFeed from '../shared/LiveContributionFeed';

export interface HomePageData {
  upcomingEvents: ClientCompat<EventWithRaces>[];
  contributions: ClientCompat<Contribution>[];
}

interface Props {
  data: HomePageData;
}

export default function Home({ data }: Props) {
  const { upcomingEvents, contributions: contributions } = data;
  return (
    <Stack>
      <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
        Upcoming Events
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Stack>
                  <Link
                    href={`/event/${event.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Stack gap="sm">
                      <Text size="lg" fw={500}>
                        {event.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                        {format(new Date(event.startDate!), 'PPP')}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {event.location}
                      </Text>
                    </Stack>
                  </Link>
                  {event.races && event.races.length > 0 && (
                    <Stack gap="xs" mt="md">
                      {event.races.map((race) => (
                        <Link
                          key={race.id}
                          href={`/race/${race.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Text size="sm">
                            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                            {format(new Date(race.startDate!), 'p')} -{' '}
                            {race.name} ({race.category})
                          </Text>
                        </Link>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
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
