import { RaceWithPreems } from '@/datastore/firestore';
import type { ClientCompat } from '@/datastore/types';
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  TitleOrder,
} from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import React from 'react';
import DateStatusBadge from '../DateStatusBadge';
import { DateLocationDetail } from './DateLocationDetail';
import { MetadataItem, MetadataRow } from './MetadataRow';

const LARGE_PREEM_THRESHOLD = 100;

interface RaceCardProps {
  race: ClientCompat<RaceWithPreems>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const RaceCard: React.FC<RaceCardProps> = ({
  race,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  const totalPrizePool = (race.preems ?? []).reduce(
    (sum, preem) => sum + (preem.prizePool ?? 0),
    0,
  );

  const dateLocationDetailContent = (
    <DateLocationDetail
      startDate={race.eventBrief?.startDate}
      location={race.eventBrief?.location}
    />
  );

  const metadataItems: MetadataItem[] = [];
  if (totalPrizePool > 0) {
    metadataItems.push({
      icon: (
        <IconSparkles
          size={18}
          color={
            totalPrizePool > LARGE_PREEM_THRESHOLD
              ? 'var(--mantine-color-green-6)'
              : 'currentColor'
          }
        />
      ),
      label: (
        <Text
          size="lg"
          fw={500}
          c={totalPrizePool > LARGE_PREEM_THRESHOLD ? 'green' : 'inherit'}
        >
          Preems ${totalPrizePool.toLocaleString()}
        </Text>
      ),
    });
  }
  metadataItems.push({
    icon: <IconUsers size={18} />,
    label: (
      <Text size="sm" fw={500}>
        {race.currentRacers} / {race.maxRacers}
      </Text>
    ),
  });
  metadataItems.push({
    icon: <IconClock size={18} />,
    label: (
      <Text size="sm" fw={500}>
        {race.duration}
      </Text>
    ),
  });
  metadataItems.push({
    icon: <IconAward size={18} />,
    label: (
      <Text size="sm" fw={500}>
        {race.laps} laps
      </Text>
    ),
  });

  return (
    <Card
      withBorder={withBorder}
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      <Grid gutter="lg" style={{ flexGrow: 1 }}>
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group align="center" gap="md">
                    <Title order={titleOrder}>{race.name}</Title>
                    <DateStatusBadge {...race} />
                  </Group>
                  <Text c="dimmed">
                    {race.category} - {race.gender}
                  </Text>
                </div>
              </Group>

              <Group mt="md" mb="md" hiddenFrom="lg">
                {dateLocationDetailContent}
              </Group>

              <Text size="sm" mt="md" mb="md">
                {race.courseDetails}
              </Text>

              <MetadataRow items={metadataItems} />
            </div>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <Stack
            align="stretch"
            justify="space-between"
            style={{ height: '100%' }}
          >
            <Stack visibleFrom="lg" gap="xs">
              {dateLocationDetailContent}
            </Stack>
            {children}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default RaceCard;
