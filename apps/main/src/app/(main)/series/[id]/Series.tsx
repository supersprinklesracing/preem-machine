'use client';

import EventCard from '@/components/EventCard';
import type {
  Contribution as FirestoreContribution,
  Event as FirestoreEvent,
  Organization as FirestoreOrganization,
  Preem as FirestorePreem,
  Race as FirestoreRace,
  RaceSeries as FirestoreRaceSeries,
} from '@/datastore/types';
import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconPencil, IconWorldWww } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';

// --- Component-Specific Data Models ---

type EnrichedEvent = FirestoreEvent & {
  races: (FirestoreRace & {
    preems: (FirestorePreem & {
      contributionHistory: FirestoreContribution[];
    })[];
  })[];
  totalCollected: number;
  totalContributors: number;
};

export interface SeriesPageData {
  series: FirestoreRaceSeries & { events: EnrichedEvent[] };
  organization: FirestoreOrganization;
}

interface Props {
  data: SeriesPageData;
}

export default function Series({ data }: Props) {
  const { series, organization } = data;
  return (
    <Stack>
      <Title>{series.name}</Title>
      <Text>
        Hosted by{' '}
        <Anchor component={Link} href={`/organization/${organization.id}`}>
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {series.region} |{' '}
        {series.startDate ? format(series.startDate.toDate(), 'PP') : ''} -{' '}
        {series.endDate ? format(series.endDate.toDate(), 'PP') : ''}
      </Text>
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Events
            </Title>
            {series.website && (
              <Group gap="xs">
                <IconWorldWww size={16} />
                <Anchor href={series.website} target="_blank" size="sm">
                  Official Website
                </Anchor>
              </Group>
            )}
          </Stack>
          <Button
            variant="outline"
            leftSection={<IconPencil size={14} />}
            size="xs"
          >
            Edit Series
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {series.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
