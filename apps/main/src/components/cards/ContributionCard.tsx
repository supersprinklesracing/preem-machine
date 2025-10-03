'use client';

import { Stack, Text } from '@mantine/core';
import Link from 'next/link';

import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { Contribution } from '@/datastore/schema';
import { formatDateRelative } from '@/dates/dates';
import { ContentCard } from './ContentCard';

interface ContributionCardProps {
  contribution: Contribution;
}

export function ContributionCard({ contribution }: ContributionCardProps) {
  const contributor = contribution.contributor;
  if (!contributor) {
    return null;
  }

  const title = <UserAvatar user={contributor} />;
  const rightColumnTop = (
    <Text c="green" fw={600}>
      ${contribution.amount}
    </Text>
  );

  const mainContent = (
    <Stack gap="xs" mt="sm">
      <Text>
        <strong>Preem:</strong>{' '}
        <Text
          component={Link}
          href={`/view/${toUrlPath(contribution.preemBrief.path)}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {contribution.preemBrief?.name}
        </Text>
      </Text>
      {contribution.message && (
        <Text fs="italic" c="dimmed">
          &quot;{contribution.message}&quot;
        </Text>
      )}
      <Text c="dimmed" size="xs" ta="right">
        {formatDateRelative(contribution.date, { addSuffix: true })}
      </Text>
    </Stack>
  );

  return (
    <ContentCard
      data-testid={`contribution-card-${contribution.id}`}
      title={title}
      rightColumnTop={rightColumnTop}
      mainContent={mainContent}
    />
  );
}