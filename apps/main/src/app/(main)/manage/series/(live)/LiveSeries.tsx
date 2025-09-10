'use client';

import { toUrlPath } from '@/datastore/paths';
import EventCard from '@/components/cards/EventCard';
import { EventWithRaces } from '@/datastore/query-schema';
import { Series } from '@/datastore/schema';
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
import { formatDateRange } from '@/firebase-client/dates';

interface Props {
  series: Pick<
    Series,
    | 'name'
    | 'path'
    | 'organizationBrief'
    | 'location'
    | 'startDate'
    | 'endDate'
    | 'description'
    | 'website'
  >;
  children: EventWithRaces[];
}

export default function LiveSeries({ series, children }: Props) {
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Group justify="space-between">
        <Title>{series.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/${toUrlPath(series.path)}/edit`}
        >
          Edit Series
        </Button>
      </Group>
      <Text>
        Hosted by{' '}
        <Anchor
          component={Link}
          href={`/manage/${toUrlPath(organization.path)}/edit`}
        >
          {organization?.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {series.location} | {formatDateRange(series.startDate, series.endDate)}
      </Text>
      {series.description && <Text>{series.description}</Text>}
      {series.website && (
        <Group gap="xs">
          <IconWorldWww size={16} />
          <Anchor href={series.website} target="_blank" size="sm">
            Official Website
          </Anchor>
        </Group>
      )}
      <Stack>
        <Title order={2}>Events Schedule</Title>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {children.map(({ event }) => (
            <EventCard key={event.id} event={event}>
              <Button
                component={Link}
                href={`/manage/${toUrlPath(event.path)}`}
                fullWidth
                mt="md"
                variant="outline"
              >
                Live
              </Button>
            </EventCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
