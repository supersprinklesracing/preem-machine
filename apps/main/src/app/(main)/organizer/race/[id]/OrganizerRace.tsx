'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import StatusBadge from '@/components/status-badge';
import type { Contribution, Race, User } from '@/datastore/types';
import {
  Avatar,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconAward,
  IconClock,
  IconDeviceTv,
  IconUsers,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export const OrganizerRace: React.FC<{ initialRace: Race; users: User[] }> = ({
  initialRace,
  users,
}) => {
  const [race, setRace] = useState<Race | undefined>(initialRace);
  const [liveContributions, setLiveContributions] = useState<
    (Contribution & { preemName: string })[]
  >([]);

  useEffect(() => {
    if (!initialRace) return;
    // Simulate live updates
    const interval = setInterval(() => {
      setRace((prevRace) => {
        if (!prevRace) return undefined;
        const newPreems = prevRace.preems.map((p) => {
          if (p.status !== 'Awarded' && Math.random() > 0.7) {
            const newAmount = Math.floor(Math.random() * 50) + 10;
            const newContribution: Contribution = {
              id: `c-live-${Date.now()}-${Math.random()}`,
              contributorId: users[Math.floor(Math.random() * users.length)].id,
              amount: newAmount,
              date: new Date().toISOString(),
              message: Math.random() > 0.5 ? "Let's go!" : undefined,
            };
            setLiveContributions((prev) => [
              { ...newContribution, preemName: p.name },
              ...prev,
            ]);
            return {
              ...p,
              prizePool: p.prizePool + newAmount,
              contributionHistory: [...p.contributionHistory, newContribution],
            };
          }
          return p;
        });
        return { ...prevRace, preems: newPreems };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [initialRace, users]);

  if (!race) {
    return <div>Race not found</div>;
  }

  const markAsAwarded = (preemId: string) => {
    setRace((prevRace) => {
      if (!prevRace) return undefined;
      return {
        ...prevRace,
        preems: prevRace.preems.map((p) =>
          p.id === preemId ? { ...p, status: 'Awarded' } : p
        ),
      };
    });
  };

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

  const preemRows = race.preems.map((preem) => (
    <Table.Tr key={preem.id}>
      <Table.Td>
        <Text fw={500}>{preem.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text c="blue" fw={600}>
          $<AnimatedNumber value={preem.prizePool} />
        </Text>
      </Table.Td>
      <Table.Td>
        <StatusBadge status={preem.status} />
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="outline"
            disabled={preem.status === 'Awarded'}
            onClick={() => markAsAwarded(preem.id)}
            leftSection={<IconAward size={14} />}
          >
            Mark as Awarded
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const contributionFeed = liveContributions.map((c) => {
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
            to &quot;{c.preemName}&quot;!
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
    <Stack gap="lg">
      <Button
        component={Link}
        href="/organizer"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
      >
        Back to Organizer Hub
      </Button>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={3}>Race Control</Title>
            <Title
              order={2}
              ff="Space Grotesk, var(--mantine-font-family)"
              mt="sm"
            >
              {race.name}
            </Title>
            <Group gap="xs" mt="sm">
              <IconClock size={16} />
              <Text size="sm" c="dimmed">
                Live for {formatDistanceToNow(new Date(race.dateTime))}
              </Text>
            </Group>
            <Group gap="xs" mt="xs">
              <IconUsers size={16} />
              <Text size="sm" c="dimmed">
                {race.currentRacers} racers competing
              </Text>
            </Group>
            <Button
              component={Link}
              href={`/big-screen/${race.id}`}
              variant="outline"
              leftSection={<IconDeviceTv size={16} />}
              mt="md"
              fullWidth
            >
              Open Big Screen
            </Button>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={3}>Preem Management</Title>
            <Table mt="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Preem</Table.Th>
                  <Table.Th>Prize Pool</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{preemRows}</Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Title order={3}>Live Contribution Feed</Title>
        <Text size="sm" c="dimmed">
          Real-time contributions as they happen.
        </Text>
        <Stack mt="md" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {liveContributions.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Waiting for contributions...
            </Text>
          ) : (
            contributionFeed
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default OrganizerRace;
