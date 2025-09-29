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
import { CSSProperties } from 'react';

import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { Contribution } from '@/datastore/schema';

interface LiveContributionFeedProps {
  contributions: Pick<
    Contribution,
    'id' | 'contributor' | 'amount' | 'preemBrief' | 'message'
  >[];
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

  const contributionFeed = contributions.map((c) => {
    const contributor = c.contributor;
    return (
      <Group key={c.id} wrap="nowrap">
        <UserAvatarIcon user={contributor} />
        <div>
          <Text size="sm">
            <Text
              component={Link}
              href={contributor?.path ? `/${toUrlPath(contributor.path)}` : '#'}
              fw={600}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {contributor?.name}
            </Text>{' '}
            -{' '}
            <Text span c="green" fw={600}>
              ${c.amount}
            </Text>{' '}
            to{' '}
            <Text
              component={Link}
              href={`/${toUrlPath(c.preemBrief.path)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              &quot;{c.preemBrief.name}&quot;
            </Text>{' '}
            in the{' '}
            <Text
              component={Link}
              href={`/${toUrlPath(c.preemBrief.raceBrief.path)}`}
              fw={600}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              &quot;{c.preemBrief.raceBrief.name}&quot;
            </Text>{' '}
            race!
          </Text>
          {c.message && (
            <Card withBorder padding="xs" mt="xs">
              <Text size="xs" fs="italic">
                &quot;{c.message}&quot;
              </Text>
            </Card>
          )}
        </div>
      </Group>
    );
  });

  return (
    <Card withBorder padding="lg" radius="md" style={cardStyle}>
      <Title order={3}>Live Contribution Feed</Title>
      <Text size="sm" c="dimmed">
        Real-time contributions as they happen.
      </Text>
      <Stack mt="md" style={stackStyle}>
        {contributions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Waiting for contributions...
          </Text>
        ) : (
          contributionFeed
        )}
      </Stack>
    </Card>
  );
}
