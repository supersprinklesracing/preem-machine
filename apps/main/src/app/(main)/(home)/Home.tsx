'use client';

import { formatDateLong, formatTime } from '@/dates/dates';
import { toUrlPath } from '@/datastore/paths';
import { EventWithRaces } from '@/datastore/query-schema';
import { Contribution } from '@/datastore/schema';
import {
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import ClientOnly from '../../../components/ClientOnly/ClientOnly';
import LiveContributionFeed from '../../../components/LiveContributionFeed/LiveContributionFeed';

interface Props {
  eventsWithRaces: EventWithRaces[];
  contributions: Contribution[];
}

export default function Home({ eventsWithRaces, contributions }: Props) {
  return (
    <Container fluid>
      <Stack>
        <Title order={1}>Upcoming Events</Title>
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
                      href={`/${toUrlPath(event.path)}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Stack gap="sm">
                        <Text size="xl" fw={500}>
                          {event?.name}
                        </Text>
                        <Group>
                          <Group gap="xs">
                            <IconCalendar size={16} />
                            <ClientOnly>
                              <Text size="sm" c="dimmed">
                                {formatDateLong(event?.startDate)}
                              </Text>
                            </ClientOnly>
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
                          href={`/${toUrlPath(race.path)}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Text size="sm">
                            <ClientOnly>
                              {formatTime(race.startDate)} - {race.name} (
                              {race.category})
                            </ClientOnly>
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
    </Container>
  );
}
