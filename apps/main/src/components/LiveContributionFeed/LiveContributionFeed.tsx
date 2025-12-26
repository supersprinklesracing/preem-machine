'use client';

import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { CSSProperties, memo } from 'react';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { Contribution } from '@/datastore/schema';

type ContributionFeedItemProps = Pick<
  Contribution,
  'id' | 'path' | 'contributor' | 'amount' | 'preemBrief' | 'message'
>;

const ContributionFeedItem = memo(
  ({ contribution }: { contribution: ContributionFeedItemProps }) => {
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
              href={`/view/${toUrlPath(
                contribution.preemBrief.raceBrief.path
              )}`}
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
  }
);
ContributionFeedItem.displayName = 'ContributionFeedItem';

interface LiveContributionFeedProps {
  contributions: ContributionFeedItemProps[];
}

export function LiveContributionFeed({
  contributions,
}: LiveContributionFeedProps) {
  const theme = useMantineTheme();
  const isLargeScreen = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);

  const cardStyle: CSSProperties = isLargeScreen
    ? {
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 180px)',
      }
    : {};

  const stackStyle: CSSProperties = isLargeScreen
    ? { flexGrow: 1, overflowY: 'auto', height: '100%' }
    : {};

  return (
    <Card withBorder padding="lg" radius="md" style={cardStyle}>
      <Title order={3}>Live Contribution Feed</Title>
      <Text size="sm" c="dimmed">
        Real-time contributions as they happen.
      </Text>
      <Stack mt="md" style={stackStyle} aria-live="polite" role="log">
        {contributions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Waiting for contributions...
          </Text>
        ) : (
          contributions.map((c) => (
            <ContributionFeedItem key={c.path} contribution={c} />
          ))
        )}
      </Stack>
    </Card>
  );
}
