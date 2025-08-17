'use client';

import { SeriesWithEvents } from '@/datastore/firestore';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import React from 'react';

interface SeriesCardProps {
  series: SeriesWithEvents;
  children?: React.ReactNode;
}

export default function SeriesCard({ series, children }: SeriesCardProps) {
  const theme = useMantineTheme();
  const isCompact = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Card withBorder padding="lg" radius="md">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Stack gap="xs">
            <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
              {series.name}
            </Title>
            <Group>
              <IconCalendar size={16} />
              <Text size="sm">
                {format(new Date(series.startDate!), 'PP')} -{' '}
                {format(new Date(series.endDate!), 'PP')}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {series.region}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group
            justify={isCompact ? 'flex-start' : 'flex-end'}
            mt={isCompact ? 'md' : 0}
          >
            {children}
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
