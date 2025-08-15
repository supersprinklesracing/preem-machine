'use client';

import ThresholdAssistantModal from '@/components/ai/threshold-assistant-modal';
import type { Race, RaceSeries } from '@/datastore/types';
import {
  Box,
  Button,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import React, { useState } from 'react';
import OrganizerEventCard from './OrganizerEventCard';
import OrganizerSeriesCard from './OrganizerSeriesCard';

interface OrganizerProps {
  raceSeries: RaceSeries[];
}

const Organizer: React.FC<OrganizerProps> = ({ raceSeries }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const totalCollected = (race: Race) =>
    race.preems.reduce((sum, preem) => sum + preem.prizePool, 0);

  const totalContributors = (race: Race) =>
    new Set(
      race.preems.flatMap((p) =>
        p.contributionHistory.map((c) => c.contributorId).filter(Boolean)
      )
    ).size;

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
            Organizer Hub
          </Title>
          <Text c="dimmed">Welcome, Bike Race Inc.!</Text>
        </div>
        <Group>
          <Button
            variant="light"
            onClick={() => setIsAiModalOpen(true)}
            leftSection={<IconSparkles size={16} />}
          >
            AI Threshold Assistant
          </Button>
          <Button leftSection={<IconPlus size={16} />}>Create New Event</Button>
        </Group>
      </Group>

      <Stack gap="xl">
        {raceSeries.map((series) => {
          const allEventsWithRaces = series.events.flatMap((event) =>
            event.races.map((race) => ({ event, race }))
          );

          const upcomingEvents = allEventsWithRaces.filter(
            ({ event }) =>
              event.status === 'Upcoming' || event.status === 'Live'
          );
          const pastEvents = allEventsWithRaces.filter(
            ({ event }) => event.status === 'Finished'
          );

          return (
            <Stack key={series.id} gap="lg">
              <OrganizerSeriesCard series={series} />

              <section>
                <Title
                  order={3}
                  ff="Space Grotesk, var(--mantine-font-family)"
                  mb="md"
                >
                  Upcoming & Live Events
                </Title>
                <Flex wrap="wrap" gap="md">
                  {upcomingEvents.map(({ event, race }) => (
                    <Box
                      key={race.id}
                      style={{ flex: '1 1 350px', minWidth: '300px' }}
                    >
                      <OrganizerEventCard
                        event={event}
                        race={race}
                        totalCollected={totalCollected(race)}
                        totalContributors={totalContributors(race)}
                      />
                    </Box>
                  ))}
                </Flex>
              </section>

              <section>
                <Title
                  order={3}
                  ff="Space Grotesk, var(--mantine-font-family)"
                  mb="md"
                >
                  Past Events
                </Title>
                <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
                  {pastEvents.map(({ event, race }) => (
                    <OrganizerEventCard
                      key={race.id}
                      event={event}
                      race={race}
                      totalCollected={totalCollected(race)}
                      totalContributors={totalContributors(race)}
                    />
                  ))}
                </SimpleGrid>
              </section>
            </Stack>
          );
        })}
      </Stack>

      <ThresholdAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        raceId="race-1"
      />
    </Stack>
  );
};

export default Organizer;
