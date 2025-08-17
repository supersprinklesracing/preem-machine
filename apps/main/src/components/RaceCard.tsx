'use client';

import { RaceWithPreems } from '@/datastore/firestore';
import {
  Card,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconAward,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import React from 'react';
import type { ClientCompat } from '../datastore/types';
import StatusBadge, { Status } from './status-badge';

const LARGE_PREEM_THRESHOLD = 100;

interface RaceCardProps {
  race: ClientCompat<RaceWithPreems>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const RaceStatusBadge = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  let status: Status | undefined = undefined;

  if (startDate && endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      status = 'Upcoming';
    } else if (now >= start && now <= end) {
      status = 'Live';
    } else if (now > end) {
      status = 'Finished';
    }
  }
  if (!status) {
    return <></>;
  }

  return <StatusBadge status={status} />;
};

const RaceCard: React.FC<RaceCardProps> = ({ race, children, style }) => {
  const totalPrizePool = (race.preems ?? []).reduce(
    (sum, preem) => sum + (preem.prizePool ?? 0),
    0
  );
  const theme = useMantineTheme();
  const isCompactLayout = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

  // This content is the same, but its container will change based on screen size.
  const dateLocationDetailContent = (
    <>
      <Group gap="xs" wrap="nowrap">
        <IconCalendar size={16} style={{ flexShrink: 0 }} />
        <Text size="sm">
          {format(new Date(race.eventBrief?.startDate ?? ''), 'PPP p')}
        </Text>
      </Group>
      <Group gap="xs" wrap="nowrap">
        <IconMapPin size={16} style={{ flexShrink: 0 }} />
        <Text size="sm">{race.eventBrief?.location}</Text>
      </Group>
    </>
  );

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      <Grid style={{ flexGrow: 1 }}>
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group align="center" gap="md">
                    <Title
                      order={1}
                      ff="Space Grotesk, var(--mantine-font-family)"
                    >
                      {race.name}
                    </Title>
                    <RaceStatusBadge {...race} />
                  </Group>
                  <Text c="dimmed">
                    {race.category} - {race.gender}
                  </Text>
                </div>
              </Group>

              {/* On mobile, location is a row here */}
              {isCompactLayout && (
                <Group mt="md" mb="md">
                  {dateLocationDetailContent}
                </Group>
              )}

              <Text size="sm" mt="md" mb="md">
                {race.courseDetails}
              </Text>

              {/* Use a wrapping Flexbox for stats to make them responsive */}
              <Flex wrap="wrap" gap="md">
                {totalPrizePool > 0 && (
                  <Group gap="xs" wrap="nowrap">
                    <IconSparkles
                      size={18}
                      color={
                        totalPrizePool > LARGE_PREEM_THRESHOLD
                          ? 'var(--mantine-color-green-6)'
                          : 'currentColor'
                      }
                    />
                    <Text
                      size="lg"
                      fw={500}
                      c={
                        totalPrizePool > LARGE_PREEM_THRESHOLD
                          ? 'green'
                          : 'inherit'
                      }
                    >
                      Preems ${totalPrizePool.toLocaleString()}
                    </Text>
                  </Group>
                )}
                <Group gap="xs" wrap="nowrap">
                  <IconUsers size={18} />
                  <Text size="sm" fw={500}>
                    {race.currentRacers} / {race.maxRacers}
                  </Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <IconClock size={18} />
                  <Text size="sm" fw={500}>
                    {race.duration}
                  </Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <IconAward size={18} />
                  <Text size="sm" fw={500}>
                    {race.laps} laps
                  </Text>
                </Group>
              </Flex>
            </div>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <Stack
            align="stretch"
            justify="space-between"
            style={{ height: '100%' }}
          >
            {/* On desktop, location is a stack here */}
            {!isCompactLayout && (
              <Stack align="flex-start" gap="xs">
                {dateLocationDetailContent}
              </Stack>
            )}
            {children}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default RaceCard;
