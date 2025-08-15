'use client';

import type { Race } from '@/datastore/types';
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendar,
  IconChartBar,
  IconCurrencyDollar,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface PastEventCardProps {
  race: Race;
  totalCollected: number;
  totalContributors: number;
}

export default function PastEventCard({
  race,
  totalCollected,
  totalContributors,
}: PastEventCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Stack>
        <Title order={4}>{race.name}</Title>
        <Group>
          <IconCalendar size={16} />
          <Text size="sm">{format(new Date(race.dateTime), 'PP')}</Text>
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
