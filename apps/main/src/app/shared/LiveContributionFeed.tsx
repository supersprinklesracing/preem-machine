'use client';

import type { Contribution, ClientCompat } from '@/datastore/types';
import {
  Avatar,
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

export interface LiveContributionFeedData {
  contributions: ClientCompat<Contribution>[];
}

interface LiveContributionFeedProps {
  data: LiveContributionFeedData;
}

export default function LiveContributionFeed({
  data,
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

  const contributionFeed = data.contributions.map((c) => {
    const contributor = c.contributor;
    return (
      <Group key={c.id} wrap="nowrap">
        <Link href={contributor?.id ? `/user/${contributor?.id}` : '#'}>
          <Avatar
            src={contributor?.avatarUrl}
            alt={contributor?.name}
            radius="xl"
          />
        </Link>
        <div>
          <Text size="sm">
            <Text
              component={Link}
              href={contributor?.id ? `/user/${contributor.id}` : '#'}
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
              href={`/preem/${c.preemBrief?.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              &quot;{c.preemBrief?.name}&quot;
            </Text>{' '}
            in the{' '}
            <Text
              component={Link}
              href={`/race/${c.preemBrief?.raceBrief?.id}`}
              fw={600}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              &quot;{c.preemBrief?.raceBrief?.name}&quot;
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
        {data.contributions.length === 0 ? (
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
