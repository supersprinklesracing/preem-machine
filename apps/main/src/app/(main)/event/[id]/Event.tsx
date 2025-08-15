'use client';

import RaceCard from '@/components/RaceCard';
import type { Event } from '@/datastore/types';
import { Button, Group, Stack, Title, SimpleGrid } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

interface EventProps {
  event: Event;
}

export default function Event({ event }: EventProps) {
  return (
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
  );
}
