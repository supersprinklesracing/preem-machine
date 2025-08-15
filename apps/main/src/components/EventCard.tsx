'use client';

import type { EnrichedEvent } from '@/datastore/data-access';
import {
  Button,
  Card,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconCalendar,
  IconChevronRight,
  IconCurrencyDollar,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
  event: EnrichedEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const theme = useMantineTheme();
  const isCompact = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Card withBorder padding="lg" radius="md" style={{ height: '100%' }}>
      <Stack justify="space-between" style={{ height: '100%' }}>
        <div>
          <Title order={4} ff="Space Grotesk, var(--mantine-font-family)">
            {event.name}
          </Title>
          <Group mt="md">
            <IconCalendar size={16} />
            <Text size="sm">{format(new Date(event.dateTime), 'PP')}</Text>
          </Group>
          <Flex wrap="wrap" gap="md" mt="md">
            <Group>
              <IconCurrencyDollar size={16} />
              <Text size="sm" c="green" fw={600}>
                ${event.totalCollected.toLocaleString()}
              </Text>
            </Group>
            <Group>
              <IconUsers size={16} />
              <Text size="sm">{event.totalContributors} Contributors</Text>
            </Group>
          </Flex>
        </div>
        <Button
          component={Link}
          href={`/event/${event.id}`}
          variant="light"
          size="sm"
          mt="md"
          fullWidth={isCompact}
          rightSection={<IconChevronRight size={14} />}
        >
          View Event
        </Button>
      </Stack>
    </Card>
  );
}
