'use client';

import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import ContributionCard from '@/components/cards/ContributionCard';
import { toUrlPath } from '@/datastore/paths';
import type { PreemWithContributions } from '@/datastore/query-schema';
import { formatDateRelative } from '@/dates/dates';
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';

interface LiveContributionsProps {
  children: PreemWithContributions[];
}

export default function ContributionsCard({
  children,
}: LiveContributionsProps) {
  const liveContributions =
    children
      ?.flatMap((p: PreemWithContributions) => p.children || [])
      .filter((c) => !!c?.contributor) ?? [];

  const contributionRows = liveContributions.map((contribution) => {
    const contributor = contribution.contributor;
    return (
      <Table.Tr key={contribution.path}>
        <Table.Td>
          <UserAvatar user={contributor} />
        </Table.Td>
        <Table.Td>
          <Text c="green" fw={600}>
            ${contribution.amount}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text
            component={Link}
            href={`/${toUrlPath(contribution.preemBrief.path)}`}
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
            {formatDateRelative(contribution.date, { addSuffix: true })}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  const contributionCards = liveContributions.map((contribution) => (
    <ContributionCard key={contribution.path} contribution={contribution} />
  ));

  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={3}>Live Contribution Feed</Title>

      {/* Desktop view */}
      <Box visibleFrom="sm" mt="md">
        <Table>
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
      </Box>

      {/* Mobile view */}
      <Box hiddenFrom="sm" mt="md">
        {liveContributions.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Waiting for contributions...
          </Text>
        ) : (
          <Stack>{contributionCards}</Stack>
        )}
      </Box>

      {liveContributions.length >= 100 && (
        <Group justify="center" mt="md">
          <Button variant="outline">View All Contributions</Button>
        </Group>
      )}
    </Card>
  );
}
