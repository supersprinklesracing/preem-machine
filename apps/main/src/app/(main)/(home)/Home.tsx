'use client';

import { formatDateLong, formatTime } from '@/dates/dates';
import { toUrlPath } from '@/datastore/paths';
import { EventWithRaces } from '@/datastore/query-schema';
import { Contribution } from '@/datastore/schema';
import { Card, Grid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import LiveContributionFeed from '../../../components/LiveContributionFeed/LiveContributionFeed';

interface Props {
  eventsWithRaces: EventWithRaces[];
  contributions: Contribution[];
}

export default function Home({ eventsWithRaces, contributions }: Props) {
  return (
    <Stack>
      <Title order={1}>Upcoming Events</Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {eventsWithRaces.map(({ event, children }) => (
              <Card
                key={event?.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Stack>
                  <Link
                    href={`/${toUrlPath(event.path)}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Stack gap="sm">
                      <Text size="lg" fw={500}>
                        {event?.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatDateLong(event?.startDate)}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {event?.location}
                      </Text>
                    </Stack>
                  </Link>
                  <Stack gap="xs" mt="md">
                    {children.map(({ race }) => (
                      <Link
                        key={race.id}
                        href={`/${toUrlPath(race.path)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Text size="sm">
                          {formatTime(race.startDate)} - {race.name} (
                          {race.category})
                        </Text>
                      </Link>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <LiveContributionFeed contributions={contributions} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
