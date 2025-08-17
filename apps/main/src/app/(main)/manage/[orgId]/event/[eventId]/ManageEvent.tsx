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

export interface ManageEventPageData {
  event: ClientCompat<EventWithRaces>;
}
interface Props {
  data: ManageEventPageData;
}

export default function ManageEvent({ data }: Props) {
  const { event } = data;
  const series = event.seriesBrief;
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Title>{event.name}</Title>
      <Text>
        Part of{' '}
        <Anchor component={Link} href={`/series/${event.seriesBrief?.id}`}>
          {series?.name}
        </Anchor>{' '}
        hosted by{' '}
        <Anchor
          component={Link}
          href={`/organization/${event.seriesBrief?.organizationBrief?.id}`}
        >
          {organization?.name}
        </Anchor>
      </Text>
      <Text c="dimmed">
        {event.location} |{' '}
        {event.startDate ? format(new Date(event.startDate ?? ''), 'PP p') : ''}
      </Text>
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
          {event.races?.map((race) => (
            <RaceCard key={race.id} race={race}>
              <Button
                component={Link}
                href={`/manage/${organization?.id}/event/${event.id}/race/${race.id}`}
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
