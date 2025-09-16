'use client';

import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { Contribution } from '@/datastore/schema';
import { formatDateRelative } from '@/dates/dates';
import { Card, Group, Stack, Text } from '@mantine/core';
import Link from 'next/link';

interface ContributionCardProps {
  contribution: Contribution;
}

export default function ContributionCard({
  contribution,
}: ContributionCardProps) {
  const contributor = contribution.contributor;
  if (!contributor) {
    return null;
  }

  return (
    <Card key={contribution.path} withBorder>
      <Group justify="space-between">
        <UserAvatar user={contributor} />
        <Text c="green" fw={600}>
          ${contribution.amount}
        </Text>
      </Group>
      <Stack gap="xs" mt="sm">
        <Text>
          <strong>Preem:</strong>{' '}
          <Text
            component={Link}
            href={`/${toUrlPath(contribution.preemBrief.path)}`}
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
    </Card>
  );
}
