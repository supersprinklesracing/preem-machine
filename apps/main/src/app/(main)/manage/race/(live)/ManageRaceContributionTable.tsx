'use client';

import { formatDateRelative } from '@/dates/dates';
import { toUrlPath } from '@/datastore/paths';
import type { PreemWithContributions } from '@/datastore/query-schema';
import { Button, Card, Group, Table, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { UserAvatar } from '@/components/UserAvatar/UserAvatar';

interface LiveContributionsProps {
  children: PreemWithContributions[];
}

export default function ManageRaceContributionTable({
  children,
}: LiveContributionsProps) {
  const liveContributions =
    children
      ?.flatMap((p: PreemWithContributions) => p.children || [])
      .filter((c) => !!c?.contributor) ?? [];

  const contributionRows = liveContributions.map((contribution) => {
    const contributor = contribution.contributor;
    return (
      <Table.Tr key={contribution.id}>
        <Table.Td>
          <UserAvatar user={contributor} />
        </Table.Td>
        <Table.Td>
          <Text c="green" fw={600}>
            ${contribution.amount}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text
            component={Link}
            href={`/${toUrlPath(contribution.preemBrief.path)}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {contribution.preemBrief?.name}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text fs="italic" c="dimmed">
            {contribution.message}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text c="dimmed" size="xs">
            {formatDateRelative(contribution.date, { addSuffix: true })}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={3}>Live Contribution Feed</Title>
      <Text size="sm" c="dimmed">
        Real-time contributions as they happen.
      </Text>
      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Contributor</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Preem</Table.Th>
            <Table.Th>Message</Table.Th>
            <Table.Th>Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {liveContributions.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text c="dimmed" ta="center" py="xl">
                  Waiting for contributions...
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            contributionRows
          )}
        </Table.Tbody>
      </Table>
      {liveContributions.length >= 100 && (
        <Group justify="center" mt="md">
          <Button variant="outline">View All Contributions</Button>
        </Group>
      )}
    </Card>
  );
}
