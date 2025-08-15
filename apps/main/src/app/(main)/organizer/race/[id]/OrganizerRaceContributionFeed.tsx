'use client';

import type { Contribution, Race, User } from '@/datastore/types';
import { Avatar, Button, Card, Group, Table, Text, Title } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface LiveContributionsProps {
  race: Race;
  users: User[];
}

export default function OrganizerRaceContributionFeed({
  race,
  users,
}: LiveContributionsProps) {
  const [liveContributions, setLiveContributions] = useState<
    (Contribution & { preemName: string; preemId: string })[]
  >([]);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      race.preems.forEach((p) => {
        if (p.status !== 'Awarded' && Math.random() > 0.7) {
          const newAmount = Math.floor(Math.random() * 50) + 10;
          const newContribution: Contribution = {
            id: uuidv4(),
            contributorId: users[Math.floor(Math.random() * users.length)].id,
            amount: newAmount,
            date: new Date().toISOString(),
            message: Math.random() > 0.5 ? "Let's go!" : undefined,
          };
          setLiveContributions((prev) =>
            [
              { ...newContribution, preemName: p.name, preemId: p.id },
              ...prev,
            ].slice(0, 100)
          );
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [race, users]);

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

  const contributionRows = liveContributions.map((c) => {
    const contributor = getContributor(c.contributorId);
    return (
      <Table.Tr key={c.id}>
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
            ${c.amount}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text
            component={Link}
            href={`/preem/${c.preemId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {c.preemName}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text fs="italic" c="dimmed">
            {c.message}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text c="dimmed" size="xs">
            {formatDistanceToNow(new Date(c.date), { addSuffix: true })}
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
