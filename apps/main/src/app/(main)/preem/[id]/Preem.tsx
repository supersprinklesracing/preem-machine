'use client';

export const dynamic = 'force-dynamic';

import AnimatedNumber from '@/components/animated-number';
import ContributionModal from '@/components/contribution-modal';
import StatusBadge from '@/components/status-badge';
import { PreemWithContributions } from '@/datastore/firestore';
import type { DeepClient } from '@/datastore/types';
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

export interface PreemPageData {
  preem: DeepClient<PreemWithContributions>;
}

interface Props {
  data: PreemPageData;
}

export const Preem: React.FC<Props> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { preem } = data;

  const contributionRows = [...(preem.contributions || [])]
    .sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
    .map((contribution) => {
      console.log(contribution);
      return (
        <Table.Tr key={contribution.id}>
          <Table.Td>
            <Group>
              <Avatar
                src={contribution.contributorBrief?.avatarUrl}
                alt={contribution.contributorBrief?.name}
                radius="xl"
              />
              <Text fw={500}>{contribution.contributorBrief?.name}</Text>
            </Group>
          </Table.Td>
          <Table.Td>
            <Text c="green" fw={600}>
              ${contribution.amount?.toLocaleString()}
            </Text>
          </Table.Td>
          <Table.Td>
            {format(new Date(contribution.date ?? ''), 'PP p')}
          </Table.Td>
          <Table.Td>
            <Text c="dimmed" fs="italic">
              {contribution.message || ''}
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
          href={`/race/${preem.raceBrief?.id}`}
          variant="subtle"
          mb="sm"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to {preem.raceBrief?.name}
        </Button>
        <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
          {preem.name}
        </Title>
        <Text c="dimmed">Part of {preem.raceBrief?.name}</Text>
      </Box>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={4} mb="md">
              Details
            </Title>
            <SimpleGrid cols={2} spacing="md">
              <Group>
                <StatusBadge status={preem.status || 'Open'} />
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
              $<AnimatedNumber value={preem.prizePool ?? 0} />
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
          {`${
            preem.contributions?.length || 0
          } contributors have built this prize pool.`}
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
        preem={{ name: preem.name ?? '' }}
      />
    </Stack>
  );
};

export default Preem;
