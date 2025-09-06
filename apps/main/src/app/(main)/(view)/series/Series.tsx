'use client';

import { organizationPath, toUrlPath } from '@/datastore/paths';
import EventCard from '@/components/cards/EventCard';
import { EventWithRaces } from '@/datastore/firestore';
import { ClientCompat, Series as SeriesType } from '@/datastore/types';
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
  series: ClientCompat<SeriesType>;
  children: EventWithRaces[];
}

export default function Series({ series, children: eventsWithRaces }: Props) {
  const organization = series.organizationBrief;
  return (
    <Stack>
      <Title>{series.name}</Title>
      <Text>
        Hosted by{' '}
        <Anchor
          component={Link}
          href={`/${toUrlPath(organizationPath(series.path))}`}
        >
          {organization.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {series.location} | {}
        {series.startDate
          ? format(new Date(series.startDate), 'PP')
          : ''} - {}
        {series.endDate ? format(new Date(series.endDate), 'PP') : ''}
      </Text>
      {series.description && <Text>{series.description}</Text>}
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
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {}
          {eventsWithRaces.map(
            ({ event }) =>
              event && (
                <EventCard key={event.id} event={event}>
                  <Button
                    component={Link}
                    href={`/${toUrlPath(event.path)}`}
                    variant="light"
                    size="sm"
                    mt="md"
                    rightSection={<IconChevronRight size={14} />}
                  >
                    View
                  </Button>
                </EventCard>
              ),
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
