'use client';

import { Avatar, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { Contribution, User } from '@/datastore/types';
import Link from 'next/link';

interface LiveContributionFeedProps {
  contributions: (Contribution & {
    preemName: string;
    raceName: string;
    raceId: string;
  })[];
  users: User[];
}

export default function LiveContributionFeed({
  contributions,
  users,
}: LiveContributionFeedProps) {
  const getContributor = (id: string | null) => {
    if (!id)
      return {
        id: null,
        name: 'Anonymous',
        avatarUrl: 'https://placehold.co/40x40.png',
      };
    return (
      users.find((u) => u.id === id) || {
        id,
        name: 'A Contributor',
        avatarUrl: 'https://placehold.co/40x40.png',
      }
    );
  };

  const contributionFeed = contributions.map((c) => {
    const contributor = getContributor(c.contributorId);
    return (
      <Group key={c.id} wrap="nowrap">
        <Link href={contributor.id ? `/user/${contributor.id}` : '#'}>
          <Avatar
            src={contributor.avatarUrl}
            alt={contributor.name}
            radius="xl"
          />
        </Link>
        <div>
          <Text size="sm">
            <Text
              component={Link}
              href={contributor.id ? `/user/${contributor.id}` : '#'}
              fw={600}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {contributor.name}
            </Text>{' '}
            just contributed{' '}
            <Text span c="green" fw={600}>
              ${c.amount}
            </Text>{' '}
            to &quot;{c.preemName}&quot; in the{' '}
            <Text
              component={Link}
              href={`/race/${c.raceId}`}
              fw={600}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              &quot;{c.raceName}&quot;
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
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 180px)',
      }}
    >
      <Title order={3}>Live Contribution Feed</Title>
      <Text size="sm" c="dimmed">
        Real-time contributions as they happen.
      </Text>
      <Stack mt="md" style={{ flexGrow: 1, overflowY: 'auto', height: '100%' }}>
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
