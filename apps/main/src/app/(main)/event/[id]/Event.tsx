'use client';

import RaceCard from '@/components/RaceCard';
import type {
  Contribution,
  Event,
  Organization,
  Preem,
  Race,
  RaceSeries,
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
import { IconPencil } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';

// --- Component-Specific Data Models ---

export interface EventPageData {
  event: Event & {
    races: (Race & {
      preems: (Preem & {
        contributionHistory: Contribution[];
      })[];
    })[];
  };
  series: RaceSeries;
  organization: Organization;
}

interface Props {
  data: EventPageData;
}

export default function Event({ data }: Props) {
  const { event, series, organization } = data;
  return (
    <Stack>
      <Title>{event.name}</Title>
      <Text>
        Part of{' '}
        <Anchor component={Link} href={`/series/${series.id}`}>
          {series.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor component={Link} href={`/organization/${organization.id}`}>
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event.location} |{' '}
        {event.startDate ? format(event.startDate.toDate(), 'PP p') : ''}
      </Text>
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Race Schedule
            </Title>
          </Stack>
          <Button
            variant="outline"
            leftSection={<IconPencil size={14} />}
            size="xs"
          >
            Edit Event
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {event.races.map((race) => (
            <RaceCard key={race.id} race={race} event={event} />
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
