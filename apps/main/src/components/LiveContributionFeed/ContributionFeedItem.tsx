import { Card, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { memo } from 'react';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { Contribution } from '@/datastore/schema';

interface ContributionFeedItemProps {
  contribution: Pick<
    Contribution,
    'id' | 'path' | 'contributor' | 'amount' | 'preemBrief' | 'message'
  >;
}

// Memoized to prevent unnecessary re-renders of the entire list when the parent component updates (e.g., on window resize)
export const ContributionFeedItem = memo(function ContributionFeedItem({
  contribution,
}: ContributionFeedItemProps) {
  const contributor = contribution.contributor;

  return (
    <Group wrap="nowrap">
      <UserAvatarIcon user={contributor} />
      <div>
        <Text size="sm">
          <Text
            component={Link}
            href={
              contributor?.path ? `/view/${toUrlPath(contributor.path)}` : '#'
            }
            fw={600}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {contributor?.name}
          </Text>{' '}
          -{' '}
          <Text span c="green" fw={600}>
            ${contribution.amount}
          </Text>{' '}
          to{' '}
          <Text
            component={Link}
            href={`/view/${toUrlPath(contribution.preemBrief.path)}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            &quot;{contribution.preemBrief.name}&quot;
          </Text>{' '}
          in the{' '}
          <Text
            component={Link}
            href={`/view/${toUrlPath(contribution.preemBrief.raceBrief.path)}`}
            fw={600}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            &quot;{contribution.preemBrief.raceBrief.name}&quot;
          </Text>{' '}
          race!
        </Text>
        {contribution.message && (
          <Card withBorder padding="xs" mt="xs">
            <Text size="xs" fs="italic">
              &quot;{contribution.message}&quot;
            </Text>
          </Card>
        )}
      </div>
    </Group>
  );
});
