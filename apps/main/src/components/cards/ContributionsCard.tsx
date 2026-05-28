'use client';

import { Box, Button, Group, Stack, Table, Text } from '@mantine/core';
import Link from 'next/link';

import { ContributionCard } from '@/components/cards/ContributionCard';
import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { getUrlPath } from '@/datastore/paths';
import type { PreemWithContributions } from '@/datastore/query-schema';
import { formatDateRelative } from '@/dates/dates';

import { ContentCard } from './ContentCard';

interface LiveContributionsProps {
  children: PreemWithContributions[];
}

export function ContributionsCard({ children }: LiveContributionsProps) {
  const liveContributions =
    children
      ?.flatMap((p: PreemWithContributions) =>
        (p.children || []).map((c) => ({ ...c, preem: p.preem })),
      )
      .filter((c) => !!c?.contributor) ?? [];

  const contributionRows = liveContributions.map((data) => {
    const { contribution, contributor, preem } = data;
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
            href={getUrlPath('/view', `preems/${contribution.preemId}`)}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {preem.name}
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

  const contributionCards = liveContributions.map((data) => (
    <ContributionCard key={data.contribution.path} data={data} />
  ));

  const mainContent = (
    <>
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
    </>
  );

  const bottomContent =
    liveContributions.length >= 100 ? (
      <Group justify="center" mt="md">
        <Button variant="outline">View All Contributions</Button>
      </Group>
    ) : null;

  return (
    <ContentCard
      title="Live Contribution Feed"
      mainContent={mainContent}
      bottomContent={bottomContent}
    />
  );
}
