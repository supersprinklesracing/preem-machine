'use client';

import { Card, Grid, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { toUrlPath } from '@/datastore/paths';
import { EventWithRaces } from '@/datastore/query-schema';
import { Contribution, Preem } from '@/datastore/schema';
import { formatDateLong, formatTime } from '@/dates/dates';

import { LiveContributionFeed } from '../../../components/LiveContributionFeed/LiveContributionFeed';
import { PreemSection } from './PreemSection';

interface Props {
  eventsWithRaces: EventWithRaces[];
  contributions: Contribution[];
  preems: Preem[];
}

export function Home({ eventsWithRaces, contributions, preems }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Stack>
      <Title order={1}>Current & Upcoming Preems</Title>
      <PreemSection preems={preems} />
      <Title order={1} mt="xl">
        Upcoming Events
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack>
            {eventsWithRaces.map(({ event, children }) => (
              <Card
                key={event?.path}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Stack>
                  <Link
                    href={`/view/${toUrlPath(event.path)}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Stack gap="sm">
                      <Text size="xl" fw={500}>
                        {event?.name}
                      </Text>
                      <Group>
                        <Group gap="xs">
                          <IconCalendar size={16} />
                          <Skeleton visible={!isMounted} width={100}>
                            <Text size="sm" c="dimmed">
                              {formatDateLong(
                                event?.startDate,
                                event?.timezone,
                              )}
                            </Text>
                          </Skeleton>
                        </Group>
                        <Group gap="xs">
                          <IconMapPin size={16} />
                          <Text size="sm" c="dimmed">
                            {event?.location}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Link>
                  <Stack gap="xs" mt="md">
                    {children.map(({ race }) => (
                      <Link
                        key={race.path}
                        href={`/view/${toUrlPath(race.path)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Skeleton visible={!isMounted} width="100%">
                          <Text size="sm">
                            {formatTime(race.startDate, race.timezone)} -{' '}
                            {race.name} ({race.category})
                          </Text>
                        </Skeleton>
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
