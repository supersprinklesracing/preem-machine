import { toUrlPath } from '@/datastore/paths';
import { Contribution, Preem } from '@/datastore/schema';
import { getSponsorName } from '@/datastore/sponsors';
import { Anchor, Text, TitleOrder } from '@mantine/core';
import { IconSparkles, IconTag, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import { MetadataItem, MetadataRow } from './MetadataRow';
import { ContentCard } from './ContentCard';

interface PreemCardProps {
  preem: Preem;
  contributions?: Contribution[];

  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
  hideBrief?: boolean;
}

const PreemCard: React.FC<PreemCardProps> = ({
  preem,
  contributions,

  children,
  style,
  withBorder = true,
  titleOrder = 3,
  hideBrief,
}) => {
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
  if (!hideBrief) {
    subheadings.push(
      <Text c="dimmed">
        Part of{' '}
        <Anchor component={Link} href={`/${toUrlPath(preem.raceBrief.path)}`}>
          {preem.raceBrief.name}
        </Anchor>
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
};

export default PreemCard;
