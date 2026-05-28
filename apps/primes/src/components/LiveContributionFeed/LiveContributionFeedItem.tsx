'use client';

import { Card, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { memo } from 'react';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { getUrlPath } from '@/datastore/paths';
import { ContributionWithUser } from '@/datastore/query-schema';

export interface LiveContributionFeedItemProps {
  data: ContributionWithUser;
}

export const LiveContributionFeedItem = memo(function LiveContributionFeedItem({
  data,
}: LiveContributionFeedItemProps) {
  const { contribution, contributor } = data;

  return (
    <Group wrap="nowrap">
      <UserAvatarIcon user={contributor} />
      <div>
        <Text size="sm">
          <Text
            component={Link}
            href={
              contributor?.path ? getUrlPath('/view', contributor.path) : '#'
            }
            fw={600}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {contributor?.name}
          </Text>{' '}
          -{' '}
          <Text span c="giroOrange.6" fw={600}>
            ${contribution.amount}
          </Text>{' '}
          to{' '}
          <Text
            component={Link}
            href={
              contribution.preemBrief?.path
                ? getUrlPath('/view', contribution.preemBrief.path)
                : '#'
            }
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            &quot;{contribution.preemBrief?.name ?? 'Preem'}&quot;
          </Text>{' '}
          in the{' '}
          <Text
            component={Link}
            href={
              contribution.preemBrief?.raceBrief?.path
                ? getUrlPath('/view', contribution.preemBrief.raceBrief.path)
                : '#'
            }
            fw={600}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            &quot;{contribution.preemBrief?.raceBrief?.name ?? 'Unknown Race'}
            &quot;
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
