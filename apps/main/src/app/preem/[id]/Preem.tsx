'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import ContributionModal from '@/components/contribution-modal';
import StatusBadge from '@/components/status-badge';

import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconClock,
  IconCurrencyDollar,
  IconTarget,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import React, { useState } from 'react';

import type { Preem as PreemType, Race, User } from '@/datastore/types';

export const Preem: React.FC<{
  preem: PreemType;
  race: Race;
  users: User[];
}> = ({ preem, race, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sponsor = preem.sponsorInfo
    ? users.find((u) => u.id === preem.sponsorInfo?.userId)
    : null;

  const getContributor = (id: string | null) => {
    if (!id)
      return { name: 'Anonymous', avatarUrl: 'https://placehold.co/40x40.png' };
    return (
      users.find((u) => u.id === id) || {
        name: 'A Contributor',
        avatarUrl: 'https://placehold.co/40x40.png',
      }
    );
  };

  const contributionRows = [...preem.contributionHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((c) => {
      const contributor = getContributor(c.contributorId);
      return (
        <Table.Tr key={c.id}>
          <Table.Td>
            <Group>
              <Avatar
                src={contributor.avatarUrl}
                alt={contributor.name}
                radius="xl"
              />
              <Text fw={500}>{contributor.name}</Text>
            </Group>
          </Table.Td>
          <Table.Td>
            <Text c="green" fw={600}>
              ${c.amount.toLocaleString()}
            </Text>
          </Table.Td>
          <Table.Td>{format(new Date(c.date), 'PP p')}</Table.Td>
          <Table.Td>
            <Text c="dimmed" fs="italic">
              {c.message || 'No message'}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    });

  return (
    <Stack gap="lg">
      <Box>
        <Button
          component={Link}
          href={`/race/${race.id}`}
          variant="subtle"
          mb="sm"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to {race.name}
        </Button>
        <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
          {preem.name}
        </Title>
        <Text c="dimmed">Part of {race.name}</Text>
      </Box>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={4} mb="md">
              Details
            </Title>
            <SimpleGrid cols={2} spacing="md">
              <Group>
                <StatusBadge status={preem.status} />
              </Group>
              <Group gap="xs">
                <IconUsers size={18} stroke={1.5} />
                <Text fw={500}>{preem.type}</Text>
              </Group>
              {preem.minimumThreshold && (
                <Group gap="xs">
                  <IconTarget size={18} stroke={1.5} />
                  <Text fw={500}>Threshold: ${preem.minimumThreshold}</Text>
                </Group>
              )}
              {preem.timeLimit && (
                <Group gap="xs">
                  <IconClock size={18} stroke={1.5} />
                  <Text fw={500}>
                    Closes: {format(new Date(preem.timeLimit), 'p')}
                  </Text>
                </Group>
              )}
            </SimpleGrid>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card
            bg="dark.6"
            c="white"
            padding="lg"
            radius="md"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Text c="dimmed">Current Prize Pool</Text>
            <Title
              order={1}
              ff="Space Grotesk, var(--mantine-font-family)"
              style={{ fontSize: '3.5rem' }}
            >
              $<AnimatedNumber value={preem.prizePool} />
            </Title>
            <Button
              color="yellow"
              mt="md"
              onClick={() => setIsModalOpen(true)}
              leftSection={<IconCurrencyDollar size={18} />}
            >
              Contribute to this Preem
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
          Contribution History
        </Title>
        <Text c="dimmed" size="sm">
          {sponsor
            ? `Sponsored by ${sponsor.name}`
            : `${preem.contributionHistory.length} contributors have built this prize pool.`}
        </Text>
        <Table mt="md" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Contributor</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Message</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{contributionRows}</Table.Tbody>
        </Table>
      </Card>
      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preem={preem}
      />
    </Stack>
  );
};

export default Preem;
