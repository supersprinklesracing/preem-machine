'use client';

import { toUrlPath } from '@/datastore/paths';
export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import PreemStatusBadge from '@/components/PreemStatusBadge';
import type { ClientCompat, Race } from '@/datastore/types';
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
  IconPencil,
  IconUsers,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React from 'react';

import type { PreemWithContributions } from '@/datastore/firestore';
import ManageRaceContributionTable from './ManageRaceContributionTable';

export interface LiveRaceProps {
  race: ClientCompat<Race>;
  children: PreemWithContributions[];
}

export const LiveRace: React.FC<LiveRaceProps> = ({ race, children }) => {
  const preemRows = children?.map(({ preem }) => (
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
        <PreemStatusBadge status={preem.status ?? 'Open'} />
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="outline"
            disabled={preem.status === 'Awarded'}
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
      <Group justify="space-between">
        <Title>{race.name}</Title>
        <Button
          variant="outline"
          leftSection={<IconPencil size={14} />}
          size="xs"
          component={Link}
          href={`/manage/${toUrlPath(race.path)}/edit`}
        >
          Edit Race
        </Button>
      </Group>
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
                {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
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
              href={`/big-screen/${toUrlPath(race.path)}`}
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

      <ManageRaceContributionTable children={children} />
    </Stack>
  );
};

export default LiveRace;
