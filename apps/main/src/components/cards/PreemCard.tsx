import { Anchor, Text, TitleOrder } from '@mantine/core';
import { IconSparkles, IconTag, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { toUrlPath } from '@/datastore/paths';
import { Contribution, Preem } from '@/datastore/schema';
import { getSponsorName } from '@/datastore/sponsors';

import { ContentCard } from './ContentCard';
import { MetadataItem, MetadataRow } from './MetadataRow';

interface PreemCardProps {
  preem: Preem;
  contributions?: Contribution[];

  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
  showEvent?: boolean;
  showRace?: boolean;
}

export function PreemCard({
  preem,
  contributions,

  children,
  style,
  withBorder = true,
  titleOrder = 3,
  showEvent = true,
  showRace = true,
}: PreemCardProps) {
  const metadataItems: MetadataItem[] = [];
  if (preem.prizePool && preem.prizePool > 0) {
    metadataItems.push({
      key: 'prize-pool',
      icon: (props) => (
        <IconSparkles
          {...props}
          color={
            preem.prizePool && preem.prizePool > 100
              ? 'var(--mantine-color-green-6)'
              : 'currentColor'
          }
        />
      ),
      label: `Prize Pool $${preem.prizePool.toLocaleString()}`,
    });
  }

  if (preem.type) {
    metadataItems.push({
      key: 'type',
      icon: (props) => <IconTag {...props} />,
      label: preem.type,
    });
  }

  const sponsorName = getSponsorName({ preem, children: contributions ?? [] });
  if (sponsorName) {
    metadataItems.push({
      key: 'sponsor',
      icon: (props) => <IconUser {...props} />,
      label: sponsorName,
    });
  }

  const subheadings = [];
  if (showRace || showEvent) {
    subheadings.push(
      <Text c="dimmed" key="brief">
        Part of{' '}
        {showRace && (
          <Anchor
            component={Link}
            href={`/view/${toUrlPath(preem.raceBrief.path)}`}
          >
            {preem.raceBrief.name}
          </Anchor>
        )}
        {showRace && showEvent && ' at '}
        {showEvent && (
          <Anchor
            component={Link}
            href={`/view/${toUrlPath(preem.raceBrief.eventBrief.path)}`}
          >
            {preem.raceBrief.eventBrief.name}
          </Anchor>
        )}
      </Text>,
    );
  }

  return (
    <ContentCard
      data-testid={`preem-card-${preem.id}`}
      title={preem.name}
      subheadings={subheadings}
      mainContent={
        <Text size="sm" mt="md" mb="md">
          {preem.description}
        </Text>
      }
      bottomContent={<MetadataRow items={metadataItems} />}
      rightColumnBottom={children}
      style={style}
      withBorder={withBorder}
      titleOrder={titleOrder}
    />
  );
}
