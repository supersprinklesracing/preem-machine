'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import StatusBadge from '@/components/status-badge';
import type { ClientCompat, User } from '@/datastore/types';
import {
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
  IconAward,
  IconClock,
  IconDeviceTv,
  IconUsers,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React, { useState } from 'react';

import type { RaceWithPreems } from '@/datastore/firestore';
import ManageRaceContributionTable from './ManageRaceContributionTable';

export interface ManageRaceData {
  race: RaceWithPreems;
  users: ClientCompat<User>[];
}

export interface ManageRaceProps {
  data: ManageRaceData;
}

export const ManageRace: React.FC<{ data: ManageRaceData }> = ({ data }) => {
  const [race, setRace] = useState<RaceWithPreems | undefined>(data.race);

  if (!race) {
    return <div>Race not found</div>;
  }

  const markAsAwarded = (preemId: string) => {
    setRace((prevRace) => {
      if (!prevRace) return undefined;
      return {
        ...prevRace,
        preems: prevRace.preems?.map((p) =>
          p.id === preemId ? { ...p, status: 'Awarded' } : p
        ),
      };
    });
  };

  const preemRows = race.preems?.map((preem) => (
    <Table.Tr key={preem.id}>
      <Table.Td>
        <Text fw={500}>{preem.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text c="blue" fw={600}>
          $<AnimatedNumber value={preem.prizePool ?? 0} />
        </Text>
      </Table.Td>
      <Table.Td>
        <StatusBadge status={preem.status ?? 'Open'} />
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

  return (
    <Stack gap="lg">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={3}>Race Control</Title>
            <Title order={2} mt="sm">
              {race.name}
            </Title>
            <Group gap="xs" mt="sm">
              <IconClock size={16} />
              <Text size="sm" c="dimmed">
                Live for {formatDistanceToNow(new Date(race.startDate!))}
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

      <ManageRaceContributionTable race={race} users={data.users} />
    </Stack>
  );
};

export default ManageRace;
