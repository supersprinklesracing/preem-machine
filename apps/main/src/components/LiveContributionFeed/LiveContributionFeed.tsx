'use client';

import { Card, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { CSSProperties } from 'react';

import { Contribution } from '@/datastore/schema';

import { ContributionFeedItem } from './ContributionFeedItem';

interface LiveContributionFeedProps {
  contributions: Pick<
    Contribution,
    'id' | 'path' | 'contributor' | 'amount' | 'preemBrief' | 'message'
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

  const contributionFeed = contributions.map((c) => (
    <ContributionFeedItem key={c.path} contribution={c} />
  ));

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
          contributionFeed
        )}
      </Stack>
    </Card>
  );
}
