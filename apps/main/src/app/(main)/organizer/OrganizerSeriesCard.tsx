'use client';

import type { RaceSeries } from '@/datastore/types';
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface OrganizerSeriesCardProps {
  series: RaceSeries;
}

export default function OrganizerSeriesCard({
  series,
}: OrganizerSeriesCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={3}>{series.name}</Title>
          <Group>
            <IconCalendar size={16} />
            <Text size="sm">
              {format(new Date(series.startDate), 'PP')} -{' '}
              {format(new Date(series.endDate), 'PP')}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {series.region}
          </Text>
        </Stack>
        <Button
          component={Link}
          href={`/organizer/series/${series.id}`}
          variant="outline"
          rightSection={<IconChevronRight size={16} />}
        >
          Manage Series
        </Button>
      </Group>
    </Card>
  );
}
