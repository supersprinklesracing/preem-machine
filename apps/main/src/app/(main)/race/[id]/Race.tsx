'use client';

export const dynamic = 'force-dynamic';

import RaceCard from '@/components/RaceCard';
import AnimatedNumber from '@/components/animated-number';
import ContributionModal from '@/components/contribution-modal';
import StatusBadge from '@/components/status-badge';
import type { Preem, Race as RaceType, User } from '@/datastore/types';
import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconCurrencyDollar, IconDeviceTv } from '@tabler/icons-react';
import Link from 'next/link';
import React, { useState } from 'react';

export const Race: React.FC<{ race: RaceType; users: User[] }> = ({
  race,
  users,
}) => {
  const [selectedPreem, setSelectedPreem] = useState<Preem | null>(null);

  if (!race) {
    return <div>Race not found</div>;
  }

  const getSponsorName = (preem: Preem) => {
    if (preem.type === 'One-Shot' && preem.sponsorInfo) {
      return (
        users.find((u) => u.id === preem.sponsorInfo?.userId)?.name ||
        'A Sponsor'
      );
    }
    return 'Community Pooled';
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

  const allContributions = race.preems
    .flatMap((p) =>
      p.contributionHistory.map((c) => ({ ...c, preemName: p.name }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const preemRows = race.preems.map((preem) => (
    <Table.Tr key={preem.id} style={{ cursor: 'pointer' }}>
      <Table.Td>
        <Link href={`/preem/${preem.id}`} passHref>
          <Text component="a" fw={500}>
            {preem.name}
          </Text>
        </Link>
      </Table.Td>
      <Table.Td>{preem.type}</Table.Td>
      <Table.Td>
        <Text c="blue" fw={600}>
          $<AnimatedNumber value={preem.prizePool} />
        </Text>
      </Table.Td>
      <Table.Td>{getSponsorName(preem)}</Table.Td>
      <Table.Td>
        <StatusBadge status={preem.status} />
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            variant="filled"
            color="yellow"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPreem(preem);
            }}
            leftSection={<IconCurrencyDollar size={14} />}
          >
            Contribute
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const contributionItems = allContributions.map((c) => {
    const contributor = getContributor(c.contributorId);
    return (
      <Box key={c.id} mb="md">
        <Group>
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
              contributed{' '}
              <Text span fw={600} c="green">
                ${c.amount}
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              to &quot;{c.preemName}&quot;
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
      </Box>
    );
  });

  return (
    <Stack gap="xl">
      <RaceCard race={race} isClickable={false} />

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Group justify="space-between" mb="md">
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Preems
            </Title>
            <Button
              component={Link}
              href={`/big-screen/${race.id}`}
              variant="outline"
              leftSection={<IconDeviceTv size={16} />}
            >
              Big Screen
            </Button>
          </Group>
          <Card withBorder padding={0} radius="md">
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Preem</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Prize Pool</Table.Th>
                  <Table.Th>Sponsored By</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{preemRows}</Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Title
            order={2}
            ff="Space Grotesk, var(--mantine-font-family)"
            mb="md"
          >
            Recent Contributions
          </Title>
          <Card
            withBorder
            padding="lg"
            radius="md"
            style={{ maxHeight: '500px', overflowY: 'auto' }}
          >
            {contributionItems}
          </Card>
        </Grid.Col>
      </Grid>
      {selectedPreem && (
        <ContributionModal
          isOpen={!!selectedPreem}
          onClose={() => setSelectedPreem(null)}
          preem={selectedPreem}
        />
      )}
    </Stack>
  );
};

export default Race;
