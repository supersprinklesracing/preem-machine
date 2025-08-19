'use client';

import RaceCard from '@/components/RaceCard';
import { EventWithRaces } from '@/datastore/firestore';
import type { ClientCompat } from '@/datastore/types';
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
import { format } from 'date-fns';
import Link from 'next/link';

export interface LiveEventPageData {
  event: ClientCompat<EventWithRaces>;
}
interface Props {
  data: LiveEventPageData;
}

export default function LiveEvent({ data }: Props) {
  const { event } = data;
  const series = event.seriesBrief;
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Group justify="space-between">
        <Title>{event.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/event/${event.id}/edit`}
        >
          Edit Event
        </Button>
      </Group>
      <Text>
        Part of{' '}
        <Anchor
          component={Link}
          href={`/manage/series/${event.seriesBrief?.id}/edit`}
        >
          {series?.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor
          component={Link}
          href={`/manage/${event.seriesBrief?.organizationBrief?.id}`}
        >
          {organization?.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event.location} |{' '}
        {event.startDate ? format(new Date(event.startDate ?? ''), 'PP p') : ''}
      </Text>
      <Stack>
        <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
          Race Schedule
        </Title>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {event.races?.map((race) => (
            <RaceCard key={race.id} race={race}>
              <Button
                component={Link}
                href={`/manage/race/${race.id}`}
                fullWidth
                mt="md"
              >
                Manage
              </Button>
            </RaceCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
