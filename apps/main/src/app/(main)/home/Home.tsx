'use client';

import {
  Badge,
  Box,
  Card,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconChevronRight,
  IconFlag,
  IconMapPin,
} from '@tabler/icons-react';
import Link from 'next/link';

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
  return (
    <Stack gap="xl">
      {/* Header section with gradient accent */}
      <Box
        p="xl"
        style={{
          background:
            'linear-gradient(135deg, var(--mantine-color-giroOrange-6) 0%, var(--mantine-color-giroYellow-6) 100%)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(249, 99, 53, 0.2)',
          color: '#ffffff',
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title
              order={1}
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              Welcome to Preem Machine
            </Title>
            <Text size="lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Fund, track, and award prime lap cash payouts in real-time.
            </Text>
          </Stack>
        </Group>
      </Box>

      {/* Preem List section */}
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon
            variant="gradient"
            gradient={{ from: 'giroOrange', to: 'giroYellow' }}
            size="md"
            radius="sm"
          >
            <IconFlag size={16} />
          </ThemeIcon>
          <Title
            order={2}
            style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
          >
            Current & Upcoming Preems
          </Title>
        </Group>
        <PreemSection preems={preems} />
      </Stack>

      {/* Main Grid layout */}
      <Grid gap="xl">
        {/* Events Column */}
        <GridCol span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <Title
              order={2}
              style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
            >
              Upcoming Events
            </Title>

            <Stack gap="md">
              {eventsWithRaces.length === 0 ? (
                <Card
                  shadow="xs"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ borderStyle: 'dashed' }}
                >
                  <Text c="dimmed" ta="center">
                    No upcoming events found. Check back later!
                  </Text>
                </Card>
              ) : (
                eventsWithRaces.map(({ event, children }) => (
                  <Card
                    key={event?.path}
                    shadow="sm"
                    padding="lg"
                    radius="lg"
                    withBorder
                  >
                    <Stack gap="md">
                      <Link
                        href={`/view/${toUrlPath(event.path)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Group
                          justify="space-between"
                          align="flex-start"
                          wrap="nowrap"
                        >
                          <Stack gap="xs">
                            <Text
                              size="xl"
                              fw={700}
                              style={{ letterSpacing: '-0.01em' }}
                            >
                              {event?.name}
                            </Text>
                            <Group gap="md">
                              <Group gap="xs">
                                <IconCalendar
                                  size={15}
                                  color="var(--mantine-color-giroOrange-6)"
                                />
                                <Text size="sm" c="dimmed">
                                  {formatDateLong(
                                    event?.startDate,
                                    event?.timezone,
                                  )}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <IconMapPin
                                  size={15}
                                  color="var(--mantine-color-giroOrange-6)"
                                />
                                <Text size="sm" c="dimmed">
                                  {event?.location}
                                </Text>
                              </Group>
                            </Group>
                          </Stack>
                          <ThemeIcon
                            variant="light"
                            color="giroOrange"
                            radius="xl"
                            size="md"
                          >
                            <IconChevronRight size={16} />
                          </ThemeIcon>
                        </Group>
                      </Link>

                      {/* Races within Event */}
                      {children.length > 0 && (
                        <Box
                          p="md"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <Stack gap="xs">
                            <Text
                              size="xs"
                              fw={700}
                              c="dimmed"
                              style={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Races scheduled
                            </Text>
                            {children.map(({ race }) => (
                              <Link
                                key={race.path}
                                href={`/view/${toUrlPath(race.path)}`}
                                style={{
                                  textDecoration: 'none',
                                  color: 'inherit',
                                }}
                              >
                                <Group
                                  justify="space-between"
                                  p="xs"
                                  style={{
                                    borderRadius: '6px',
                                    transition: 'background 0.15s ease',
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      'rgba(255, 255, 255, 0.03)')
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      'transparent')
                                  }
                                >
                                  <Text size="sm" fw={500}>
                                    {race.name}
                                  </Text>
                                  <Group gap="xs">
                                    <Badge
                                      variant="outline"
                                      color="giroPurple"
                                      size="sm"
                                    >
                                      {race.category}
                                    </Badge>
                                    <Text size="xs" c="dimmed">
                                      {formatTime(
                                        race.startDate,
                                        race.timezone,
                                      )}
                                    </Text>
                                  </Group>
                                </Group>
                              </Link>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </Stack>
        </GridCol>

        {/* Live Contribution Feed Column */}
        <GridCol span={{ base: 12, lg: 4 }}>
          <LiveContributionFeed contributions={contributions} />
        </GridCol>
      </Grid>
    </Stack>
  );
}
