'use client';

import { racePath, toUrlPath } from '@/datastore/paths';
import AnimatedNumber from '@/components/animated-number';
import ContributionModal from '@/components/contribution-modal';
import PreemStatusBadge from '@/components/PreemStatusBadge';
import { Preem as PreemType, Contribution } from '@/datastore/schema';
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

interface Props {
  preem: PreemType;
  children: Contribution[];
}

export const Preem: React.FC<Props> = ({ preem, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contributionRows = [...(children || [])]
    .sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
    )
    .map((contribution) => {
      return (
        <Table.Tr key={contribution.id}>
          <Table.Td>
            <Group>
              <Avatar
                src={contribution.contributor?.avatarUrl}
                alt={contribution.contributor?.name}
                radius="xl"
              />
              <Text fw={500}>{contribution.contributor?.name}</Text>
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
          href={`/${toUrlPath(racePath(preem.path))}`}
          variant="subtle"
          mb="sm"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to {preem.raceBrief.name}
        </Button>
        <Title order={1}>{preem.name}</Title>
        <Text c="dimmed">Part of {preem.raceBrief.name}</Text>
        {preem.description && <Text mt="md">{preem.description}</Text>}
      </Box>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={4} mb="md">
              Details
            </Title>
            <SimpleGrid cols={2} spacing="md">
              <Group>
                <PreemStatusBadge status={preem.status || 'Open'} />
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
                    Ends: {format(new Date(preem.timeLimit), 'PP p')}
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
            <Title order={1} style={{ fontSize: '3.5rem' }}>
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
        <Title order={3}>Contribution History</Title>
        <Text c="dimmed" size="sm">
          {`${children?.length || 0} contributors have built this prize pool.`}
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
        preem={{
          id: preem.id ?? '',
          path: preem.path ?? '',
          name: preem.name ?? '',
        }}
      />
    </Stack>
  );
};

export default Preem;
