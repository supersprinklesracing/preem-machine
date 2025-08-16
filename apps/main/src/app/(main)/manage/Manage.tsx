'use client';

import ThresholdAssistantModal from '@/components/ai/threshold-assistant-modal';
import EventCard from '@/components/EventCard';
import SeriesCard from '@/components/SeriesCard';
import { Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import React, { useState } from 'react';
import type {
  RaceSeries,
  Event,
  Race,
  Preem,
  Contribution,
} from '@/datastore/types';

// --- Component-Specific Data Models ---

type EnrichedEvent = Event & {
  races: (Race & {
    preems: (Preem & {
      contributionHistory: Contribution[];
    })[];
  })[];
  totalCollected: number;
  totalContributors: number;
};

type EnrichedSeries = RaceSeries & { events: EnrichedEvent[] };

export interface ManagePageData {
  raceSeries: EnrichedSeries[];
}

interface Props {
  data: ManagePageData;
}

const Manage: React.FC<Props> = ({ data }) => {
  const { raceSeries } = data;
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
          const upcomingEvents = series.events.filter(
            (event) => event.status === 'Upcoming' || event.status === 'Live'
          );
          const pastEvents = series.events.filter(
            (event) => event.status === 'Finished'
          );

          return (
            <Stack key={series.id} gap="lg">
              <SeriesCard series={series} />

              <section>
                <Title
                  order={3}
                  ff="Space Grotesk, var(--mantine-font-family)"
                  mb="md"
                >
                  Upcoming & Live Events
                </Title>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </SimpleGrid>
              </section>

              <section>
                <Title
                  order={3}
                  ff="Space Grotesk, var(--mantine-font-family)"
                  mb="md"
                >
                  Past Events
                </Title>
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
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

export default Manage;
