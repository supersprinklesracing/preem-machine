import EventCard from '@/components/EventCard';
import type { EnrichedEvent } from '@/datastore/data-access';
import type { RaceSeries } from '@/datastore/types';
import { Button, Group, SimpleGrid, Stack, Title, Anchor } from '@mantine/core';
import { IconPencil, IconWorldWww } from '@tabler/icons-react';

interface SeriesProps {
  series: Omit<RaceSeries, 'events'> & { events: EnrichedEvent[] };
}

export default function Series({ series }: SeriesProps) {
  return (
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
  );
}
