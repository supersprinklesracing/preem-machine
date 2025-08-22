'use client';

import EventCard from '@/components/cards/EventCard';
import { SeriesWithEvents } from '@/datastore/firestore';
import { ClientCompat } from '@/datastore/types';
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

export interface SeriesPageData {
  series: ClientCompat<SeriesWithEvents>;
}

interface Props {
  data: SeriesPageData;
}

export default function Series({ data }: Props) {
  const { series } = data;
  const organization = series.organizationBrief;
  return (
    <Stack>
      <Title>{series.name}</Title>
      <Text>
        Hosted by{' '}
        <Anchor component={Link} href={`/organization/${organization?.id}`}>
          {organization?.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {series.location} |{' '}
        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
        {series.startDate ? format(new Date(series.startDate!), 'PP') : ''} -{' '}
        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
        {series.endDate ? format(new Date(series.endDate!), 'PP') : ''}
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
        </Group>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          {series.events!.map((event) => (
            <EventCard key={event.id} event={event}>
              <Button
                component={Link}
                href={`/event/${event.id}`}
                variant="light"
                size="sm"
                mt="md"
                rightSection={<IconChevronRight size={14} />}
              >
                View
              </Button>
            </EventCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
