'use client';

export const dynamic = 'force-dynamic';

import RaceCard from '@/components/RaceCard';
import AnimatedNumber from '@/components/animated-number';
import ContributionModal from '@/components/contribution-modal';
import StatusBadge from '@/components/status-badge';
import { PreemWithContributions, RaceWithPreems } from '@/datastore/firestore';
import { ClientCompat } from '@/datastore/types';
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

export interface RacePageData {
  race: ClientCompat<RaceWithPreems>;
}

interface Props {
  data: RacePageData;
}

export const Race: React.FC<Props> = ({ data }) => {
  const { race } = data;
  const [selectedPreem, setSelectedPreem] = useState<any | null>(null);

  if (!race) {
    return <div>Race not found</div>;
  }

  const getSponsorName = (preem: PreemWithContributions) => {
    const name = preem.contributions?.[0]?.contributor?.name;
    if (preem.type === 'One-Shot' && name) {
      return name || 'A Sponsor';
    }
    return 'Community Pooled';
  };

  const allContributions = (race.preems || [])
    .flatMap((p) =>
      (p.contributions || []).map((c) => ({
        ...c,
        preemName: p.name,
        preemId: p.id,
      }))
    )
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  const preemRows = (race.preems || []).map((preem) => (
    <Table.Tr key={preem.id} style={{ cursor: 'pointer' }}>
      <Table.Td>
        <Link
          href={`/preem/${preem.id}`}
          passHref
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Text fw={500}>{preem.name}</Text>
        </Link>
      </Table.Td>
      <Table.Td>{preem.type}</Table.Td>
      <Table.Td>
        <Text c="blue" fw={600}>
          $<AnimatedNumber value={preem.prizePool ?? 0} />
        </Text>
      </Table.Td>
      <Table.Td>{getSponsorName(preem)}</Table.Td>
      <Table.Td>
        <StatusBadge status={preem.status || 'Open'} />
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
    const contributor = c.contributor
      ? {
          id: c.contributor.id,
          name: c.contributor.name,
          avatarUrl: c.contributor.avatarUrl,
        }
      : {
          id: undefined,
          name: 'Anonymous',
          avatarUrl: 'https://placehold.co/40x40.png',
        };
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
              to{' '}
              <Text
                component={Link}
                href={`/preem/${c.preemId}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                &quot;{c.preemName}&quot;
              </Text>
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
      <RaceCard race={race} />

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
          <div
            style={{
              position: 'sticky',
              top: '80px',
              height: 'calc(100vh - 180px)',
            }}
          >
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
              style={{ height: '100%', overflowY: 'auto' }}
            >
              {contributionItems}
            </Card>
          </div>
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
