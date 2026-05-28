'use client';

import { Stack, Text } from '@mantine/core';
import Link from 'next/link';

import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { getUrlPath } from '@/datastore/paths';
import { ContributionWithUser } from '@/datastore/query-schema';
import { formatDateRelative } from '@/dates/dates';

import { ContentCard } from './ContentCard';

interface ContributionCardProps {
  data: ContributionWithUser & { preem?: { name?: string } };
}

export function ContributionCard({ data }: ContributionCardProps) {
  const { contribution, contributor, preem } = data;
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
          href={getUrlPath('/view', `preems/${contribution.preemId}`)}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {preem?.name || 'Preem'}
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
      key={contribution.path}
      data-testid={`contribution-card-${contribution.id}`}
      title={title}
      rightColumnTop={rightColumnTop}
      mainContent={mainContent}
    />
  );
}
