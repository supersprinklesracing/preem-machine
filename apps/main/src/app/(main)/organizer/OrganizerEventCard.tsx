'use client';

import type { Event, Race } from '@/datastore/types';
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendar,
  IconChartBar,
  IconCurrencyDollar,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface OrganizerEventCardProps {
  race: Race;
  event: Event;
  totalCollected: number;
  totalContributors: number;
}

export default function OrganizerEventCard({
  race,
  event,
  totalCollected,
  totalContributors,
}: OrganizerEventCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Stack>
        <Title order={4}>{event.name}</Title>
        <Group>
          <IconCalendar size={16} />
          <Text size="sm">{format(new Date(event.dateTime), 'PP')}</Text>
        </Group>
        <Group>
          <IconCurrencyDollar size={16} />
          <Text size="sm" c="green" fw={600}>
            ${totalCollected.toLocaleString()}
          </Text>
        </Group>
        <Group>
          <IconUsers size={16} />
          <Text size="sm">{totalContributors} Contributors</Text>
        </Group>
        <Button
          component={Link}
          href={`/organizer/race/${race.id}`}
          variant="outline"
          size="xs"
          leftSection={<IconChartBar size={14} />}
        >
          View Report
        </Button>
      </Stack>
    </Card>
  );
}
