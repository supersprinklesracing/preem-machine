'use client';

import type { RaceSeries } from '@/datastore/types';
import {
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface SeriesCardProps {
  series: RaceSeries;
}

export default function SeriesCard({ series }: SeriesCardProps) {
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
                {format(new Date(series.startDate), 'PP')} -{' '}
                {format(new Date(series.endDate), 'PP')}
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
            <Button
              component={Link}
              href={`/series/${series.id}`}
              variant="light"
              rightSection={<IconChevronRight size={16} />}
            >
              Manage Series
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
