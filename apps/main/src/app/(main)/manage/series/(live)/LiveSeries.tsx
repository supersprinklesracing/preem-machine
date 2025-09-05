'use client';

import { toUrlPath } from '@/datastore/paths';
import EventCard from '@/components/cards/EventCard';
import { EventWithRaces } from '@/datastore/firestore';
import type { ClientCompat, Series } from '@/datastore/types';
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
import Link from 'next/link';

interface Props {
  series: ClientCompat<Series>;
  children: EventWithRaces[];
}

export default function LiveSeries({ series, children }: Props) {
  const organization = series?.organizationBrief;

  return (
    <Stack>
      <Group justify="space-between">
        <Title>{series.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/${toUrlPath(series.path)}/edit`}
        >
          Edit Series
        </Button>
      </Group>
      <Text>
        Hosted by{' '}
        <Anchor
          component={Link}
          href={`/manage/${toUrlPath(organization.path)}/edit`}
        >
          {organization?.name}
        </Anchor>
      </Text>
      <Stack>
        <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
          Events Schedule
        </Title>
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {children.map(({ event }) => (
            <EventCard key={event.id} event={event}>
              <Button
                component={Link}
                href={`/manage/${toUrlPath(event.path)}`}
                fullWidth
                mt="md"
                variant="outline"
              >
                Live
              </Button>
            </EventCard>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
