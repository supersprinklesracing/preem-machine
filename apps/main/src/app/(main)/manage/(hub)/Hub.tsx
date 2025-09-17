'use client';

import ThresholdAssistantModal from '@/components/ai/threshold-assistant-modal';
import EventCard from '@/components/cards/EventCard';
import RaceCard from '@/components/cards/RaceCard';
import SeriesCard from '@/components/cards/SeriesCard';
import { isDateAfter } from '@/dates/dates';
import { toUrlPath } from '@/datastore/paths';
import { OrganizationWithSeries } from '@/datastore/query-schema';
import {
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface Props {
  organizations: OrganizationWithSeries[];
}

const Hub: React.FC<Props> = ({ organizations }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (Object.keys(organizations).length === 0) {
    return (
      <Container>
        <Title order={1}>Organizer Hub</Title>
        <Text c="dimmed" mb="xl">
          You are not a member of any organizations yet.
        </Text>
        <Button component={Link} href="/manage/organization/new">
          Create an Organization
        </Button>
      </Container>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Stack>
          <Title order={1}>Organizer Hub</Title>
          <Text c="dimmed">Manage your organizations and events.</Text>
        </Stack>
        <Group>
          <Button
            variant="light"
            onClick={() => setIsAiModalOpen(true)}
            leftSection={<IconSparkles size={16} />}
          >
            AI Threshold Assistant
          </Button>
          <Button
            component={Link}
            href="/manage/series/new"
            leftSection={<IconPlus size={16} />}
          >
            Create New Series
          </Button>
        </Group>
      </Group>

      <Grid>
        {organizations.map(({ organization }) => (
          <Grid.Col key={organization.id} span={{ base: 12 }}>
            <Group justify="space-between" mb="md">
              <Title order={1}>{organization.name}</Title>
              <Button
                component={Link}
                href={`/manage/${toUrlPath(organization.path)}/edit`}
                variant="outline"
                leftSection={<IconPencil size={16} />}
              >
                Edit Organization
              </Button>
            </Group>
          </Grid.Col>
        ))}

        {organizations.map((org) =>
          org.children?.map(({ series, children: eventWithRaces }) => {
            const now = new Date();
            const upcomingEvents =
              eventWithRaces?.filter(
                ({ event }) => event.endDate && isDateAfter(event.endDate, now),
              ) ?? [];
            const pastEvents =
              eventWithRaces.filter(
                ({ event }) =>
                  event.endDate && !isDateAfter(event.endDate, now),
              ) ?? [];

            return (
              <React.Fragment key={series.id}>
                <Grid.Col span={{ base: 12, xs: 12, md: 6, lg: 9, xl: 6 }}>
                  <SeriesCard series={series} titleOrder={2}>
                    <Button
                      component={Link}
                      href={`/manage/${toUrlPath(series.path)}/edit`}
                      variant="light"
                      rightSection={<IconChevronRight size={16} />}
                    >
                      Edit Series
                    </Button>
                  </SeriesCard>
                </Grid.Col>

                {upcomingEvents.length > 0 && (
                  <>
                    <Grid.Col span={{ base: 12 }}>
                      <Title order={2} mb="md">
                        Upcoming & Live Events
                      </Title>
                    </Grid.Col>
                    {upcomingEvents.map(({ event }) => (
                      <Grid.Col
                        key={event.id}
                        span={{ base: 12, xs: 12, md: 6, lg: 9, xl: 6 }}
                      >
                        <EventCard event={event} titleOrder={2}>
                          <Button
                            component={Link}
                            href={`/manage/${toUrlPath(event.path)}/live`}
                            variant="gradient"
                            size="sm"
                            mt="md"
                            rightSection={<IconChevronRight size={14} />}
                          >
                            Live
                          </Button>
                        </EventCard>
                      </Grid.Col>
                    ))}
                  </>
                )}

                {upcomingEvents.flatMap(
                  ({ children: raceWithPreems }) => raceWithPreems ?? [],
                ).length > 0 && (
                  <>
                    <Grid.Col span={{ base: 12 }}>
                      <Title order={2} mb="md">
                        Races
                      </Title>
                    </Grid.Col>
                    {upcomingEvents
                      .flatMap(
                        ({ children: raceWithPreems }) => raceWithPreems ?? [],
                      )
                      .map(({ race, children }) => (
                        <Grid.Col
                          key={race.id}
                          span={{ base: 12, md: 6, xl: 3 }}
                        >
                          <RaceCard
                            race={race}
                            preems={children}
                            titleOrder={2}
                          />
                        </Grid.Col>
                      ))}
                  </>
                )}

                {pastEvents.length > 0 && (
                  <Grid.Col span={12}>
                    <section>
                      <Title order={4} mb="md">
                        Past Events
                      </Title>
                      <Grid>
                        {pastEvents.map(({ event }) => (
                          <Grid.Col
                            key={event.path}
                            span={{ base: 12, md: 6, lg: 3 }}
                          >
                            <EventCard event={event} titleOrder={2}>
                              <Button
                                component={Link}
                                href={`/manage/${toUrlPath(event.path)}`}
                                variant="light"
                                size="sm"
                                mt="md"
                                rightSection={<IconChevronRight size={14} />}
                              >
                                Manage event
                              </Button>
                            </EventCard>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </section>
                  </Grid.Col>
                )}
              </React.Fragment>
            );
          }),
        )}
      </Grid>

      <ThresholdAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        raceId="race-1"
      />
    </Stack>
  );
};

export default Hub;
