import { Anchor, Group, Text, TitleOrder } from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconSparkles,
  IconUsers,
  IconWorldWww,
} from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { toUrlPath } from '@/datastore/paths';
import { PreemWithContributions } from '@/datastore/query-schema';
import { Race } from '@/datastore/schema';

import { DateStatusBadge } from '../DateStatusBadge/DateStatusBadge';
import { ContentCard } from './ContentCard';
import { DateLocationDetail } from './DateLocationDetail';
import { MetadataItem, MetadataRow } from './MetadataRow';

const LARGE_PREEM_THRESHOLD = 100;

interface RaceCardProps {
  race: Race;
  preems: PreemWithContributions[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
  showEventLink?: boolean;
}

export function RaceCard({
  race,
  preems,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
  showEventLink = true,
}: RaceCardProps) {
  const totalPrizePool = preems.reduce(
    (sum, { preem }) => sum + (preem.prizePool ?? 0),
    0,
  );

  const subheadings = [];
  if (showEventLink) {
    subheadings.push(
      <React.Fragment key="event-link">
        Part of{' '}
        <Anchor component={Link} href={`/${toUrlPath(race.eventBrief.path)}`}>
          {race.eventBrief.name}
        </Anchor>
      </React.Fragment>,
    );
  }
  subheadings.push(`${race.category} - ${race.gender}`);

  const metadataItems: MetadataItem[] = [];
  if (totalPrizePool > 0) {
    metadataItems.push({
      key: 'preems',
      icon: (props) => (
        <IconSparkles
          {...props}
          color={
            totalPrizePool > LARGE_PREEM_THRESHOLD
              ? 'var(--mantine-color-green-6)'
              : 'currentColor'
          }
        />
      ),
      label: `Preems $${totalPrizePool.toLocaleString()}`,
    });
  }
  metadataItems.push({
    key: 'racers',
    icon: (props) => <IconUsers {...props} />,
    label: `${race.currentRacers} / ${race.maxRacers}`,
  });
  metadataItems.push({
    key: 'duration',
    icon: (props) => <IconClock {...props} />,
    label: race.duration,
  });
  metadataItems.push({
    key: 'laps',
    icon: (props) => <IconAward {...props} />,
    label: `${race.laps} laps`,
  });

  const mainContent = (
    <>
      <Group mt="md" mb="md" hiddenFrom="lg">
        <DateLocationDetail {...race} />
      </Group>
      <Text size="sm" mt="md" mb="md">
        {race.description}
      </Text>
      <Text size="sm" mt="md" mb="md">
        {race.courseDetails}
      </Text>
      {race.website && (
        <Group gap="xs">
          <IconWorldWww size={16} />
          <Anchor href={race.website} target="_blank" size="sm">
            Official Website
          </Anchor>
        </Group>
      )}
    </>
  );

  const bottomContent = (
    <>
      <MetadataRow items={metadataItems} />
      {race.sponsors && race.sponsors.length > 0 && (
        <Text size="sm" mt="md">
          Sponsored by: {race.sponsors.join(', ')}
        </Text>
      )}
    </>
  );

  return (
    <ContentCard
      title={race.name}
      statusBadge={<DateStatusBadge {...race} />}
      subheadings={subheadings}
      mainContent={mainContent}
      bottomContent={bottomContent}
      rightColumnTop={<DateLocationDetail {...race} />}
      rightColumnBottom={children}
      style={style}
      withBorder={withBorder}
      titleOrder={titleOrder}
    />
  );
}
