'use client';

import { PreemWithContributions, RaceWithPreems } from '@/datastore/firestore';
import { DeepClient, User } from '@/datastore/types';
import { Avatar, Button, Card, Group, Table, Text, Title } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface LiveContributionsProps {
  race: RaceWithPreems;
  users: DeepClient<User>[];
}

export default function ManageRaceContributionFeed({
  race,
  users,
}: LiveContributionsProps) {
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

  const liveContributions =
    race.preems
      ?.flatMap((p: PreemWithContributions) => p.contributions)
      .filter((p) => !!p) ?? [];

  const contributionRows = liveContributions.map((contribution) => {
    const contributor = getContributor(
      contribution?.contributorBrief?.id ?? null
    );
    return (
      <Table.Tr key={contribution.id}>
        <Table.Td>
          <Group>
            <Link href={contributor.id ? `/user/${contributor.id}` : '#'}>
              <Avatar
                src={contributor.avatarUrl}
                alt={contributor.name}
                radius="xl"
              />
            </Link>
            <Text
              component={Link}
              href={contributor.id ? `/user/${contributor.id}` : '#'}
              fw={500}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {contributor.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text c="green" fw={600}>
            ${contribution.amount}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text
            component={Link}
            href={`/preem/${contribution.preemBrief?.id}`}
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
            {contribution.date
              ? formatDistanceToNow(new Date(contribution.date), {
                  addSuffix: true,
                })
              : ''}
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
