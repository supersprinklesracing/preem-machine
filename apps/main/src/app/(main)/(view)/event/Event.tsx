'use client';

import { organizationPath, seriesPath, toUrlPath } from '@/datastore/paths';
import RaceCard from '@/components/cards/RaceCard';
import { RaceWithPreems } from '@/datastore/firestore';
import { Event as EventType } from '@/datastore/schema';
import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconWorldWww } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Props {
  event: EventType;
  children: RaceWithPreems[];
}

export default function Event({ event, children }: Props) {
  const series = event.seriesBrief;
  const organization = series.organizationBrief;

  return (
    <Stack>
      <Title>{event.name}</Title>
      <Text>
        Part of{' '}
        <Anchor component={Link} href={`/${toUrlPath(seriesPath(event.path))}`}>
          {series.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor
          component={Link}
          href={`/${toUrlPath(organizationPath(event.path))}`}
        >
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event.location} |{' '}
        {event.startDate ? format(new Date(event.startDate ?? ''), 'PP p') : ''}
      </Text>
      {event.description && <Text>{event.description}</Text>}
      {event.website && (
        <Group gap="xs">
          <IconWorldWww size={16} />
          <Anchor href={event.website} target="_blank" size="sm">
            Official Website
          </Anchor>
        </Group>
      )}
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2}>Race Schedule</Title>
          </Stack>
        </Group>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {children?.map(
            ({ race, children }) =>
              race && (
                <RaceCard key={race.id} race={race} preems={children}>
                  <Button
                    component={Link}
                    href={`/${toUrlPath(race.path)}`}
                    variant="light"
                    size="sm"
                    mt="md"
                    rightSection={<IconChevronRight size={14} />}
                  >
                    View
                  </Button>
                </RaceCard>
              ),
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
