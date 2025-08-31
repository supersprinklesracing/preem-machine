'use client';

import RaceCard from '@/components/cards/RaceCard';
import { RaceWithPreems } from '@/datastore/firestore';
import type { ClientCompat, Event } from '@/datastore/types';
import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight, IconPencil } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Props {
  event: ClientCompat<Event>;
  children: RaceWithPreems[];
}

export default function LiveEvent({ event, children }: Props) {
  const series = event.seriesBrief;
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Group justify="space-between">
        <Title>{event?.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/event/${event?.id}/edit`}
        >
          Edit Event
        </Button>
      </Group>
      <Text>
        Part of{' '}
        <Anchor
          component={Link}
          href={`/manage/series/${event?.seriesBrief?.id}/edit`}
        >
          {series?.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor
          component={Link}
          href={`/manage/organization/${event?.seriesBrief?.organizationBrief?.id}/edit`}
        >
          {organization?.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event?.location} |{' '}
        {event?.startDate
          ? format(new Date(event?.startDate ?? ''), 'PP p')
          : ''}
      </Text>
      <Stack>
        <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
          Race Schedule
        </Title>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {children?.map(
            ({ race, children }) =>
              race && (
                <RaceCard key={race.id} race={race} preems={children}>
                  <Button
                    component={Link}
                    href={`/manage/race?path=${race.path}`}
                    variant="light"
                    size="sm"
                    mt="md"
                    rightSection={<IconChevronRight size={14} />}
                  >
                    Manage
                  </Button>
                </RaceCard>
              ),
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
