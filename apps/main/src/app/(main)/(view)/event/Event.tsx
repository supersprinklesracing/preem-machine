'use client';

import RaceCard from '@/components/cards/RaceCard';
import { RaceWithPreems } from '@/datastore/firestore';
import { ClientCompat, Event as EventType } from '@/datastore/types';
import {
  Anchor,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Props {
  event: ClientCompat<EventType>;
  children: RaceWithPreems[];
}

export default function Event({ event, children }: Props) {
  const series = event.seriesBrief;
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Title>{event?.name}</Title>
      <Text>
        Part of{' '}
        <Anchor component={Link} href={`/series/${event?.seriesBrief?.id}`}>
          {series?.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor
          component={Link}
          href={`/organization/${event?.seriesBrief?.organizationBrief?.id}`}
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
        <Group justify="space-between">
          <Stack gap={0}>
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Race Schedule
            </Title>
          </Stack>
        </Group>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {children?.map(
            ({ race, children }) =>
              race && (
                <RaceCard key={race.id} race={race} preems={children}>
                  <Button
                    component={Link}
                    href={`/race/${race.id}`}
                    variant="light"
                    size="sm"
                    mt="md"
                    rightSection={<IconChevronRight size={14} />}
                  >
                    View
                  </Button>
                </RaceCard>
              ),
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
