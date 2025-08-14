'use client';

import { Card, Grid, Group, Stack, Text, Title } from '@mantine/core';
import {
  IconAward,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import type { Race } from '../datastore/types';
import StatusBadge from './status-badge';

interface RaceCardProps {
  race: Race;
  isClickable?: boolean;
}

const RaceCard: React.FC<RaceCardProps> = ({ race, isClickable = true }) => {
  const cardContent = (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: isClickable ? 'pointer' : 'default',
      }}
    >
      <Stack justify="space-between" style={{ flexGrow: 1 }}>
        <div>
          <Group justify="space-between" align="flex-start">
            <div>
              <StatusBadge status={race.status} />
              <Title
                order={1}
                ff="Space Grotesk, var(--mantine-font-family)"
                mt="sm"
              >
                {race.name}
              </Title>
              <Text c="dimmed">
                {race.category} - {race.gender}
              </Text>
            </div>
            <Stack align="flex-end" gap="xs">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">
                  {format(new Date(race.dateTime), 'PPP p')}
                </Text>
              </Group>
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text size="sm">{race.location}</Text>
              </Group>
            </Stack>
          </Group>
          <Text size="sm" mt="xs" mb="md">
            {race.courseDetails}
          </Text>
          <Grid>
            <Grid.Col span={{ base: 6, sm: 4, md: 2.4 }}>
              <Group gap="xs">
                <IconUsers size={18} />
                <Text size="sm" fw={500}>
                  {race.currentRacers} / {race.maxRacers} Racers
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4, md: 2.4 }}>
              <Group gap="xs">
                <IconClock size={18} />
                <Text size="sm" fw={500}>
                  {race.duration}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4, md: 2.4 }}>
              <Group gap="xs">
                <IconAward size={18} />
                <Text size="sm" fw={500}>
                  {race.laps} laps
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4, md: 2.4 }}>
              <Group gap="xs">
                <IconUsersGroup size={18} />
                <Text size="sm" fw={500}>
                  {race.ageCategory}
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </div>
      </Stack>
    </Card>
  );

  if (isClickable) {
    return (
      <Link
        href={`/race/${race.id}`}
        passHref
        style={{ textDecoration: 'none' }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default RaceCard;
