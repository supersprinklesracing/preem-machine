'use client';

import AnimatedNumber from '@/components/AnimatedNumber';
import RaceCard from '@/components/cards/RaceCard';
import ContributionModal from '@/components/ContributionModal';
import CourseLink from '@/components/CourseLink/CourseLink';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import PreemStatusBadge from '@/components/PreemStatusBadge/PreemStatusBadge';
import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import { PreemWithContributions } from '@/datastore/query-schema';
import { Preem, Race as RaceType } from '@/datastore/schema';
import {
  Box,
  Button,
  Card,
  Container,
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
import { getSponsorName } from '@/datastore/sponsors';
import PreemCard from '@/components/cards/PreemCard';

interface Props {
  race: RaceType;
  children: PreemWithContributions[];
}

export const Race: React.FC<Props> = ({ race, children }) => {
  const [selectedPreem, setSelectedPreem] = useState<Preem | null>(null);

  const allContributions = children
    .flatMap((p) =>
      (p.children || []).map((c) => ({
        ...c,
        preemName: p.preem?.name,
        preemId: p.preem?.id,
        preemPath: p.preem?.path,
      })),
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  const preemRows = children.map((preemWithContributions) => {
    const { preem } = preemWithContributions;
    if (!preem) {
      return null;
    }
    return (
      <Table.Tr key={preem.id}>
        <Table.Td>
          <Link
            href={`/${toUrlPath(preem.path)}`}
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
        <Table.Td>{getSponsorName(preemWithContributions) ?? ''}</Table.Td>
        <Table.Td>
          <PreemStatusBadge status={preem.status || 'Open'} />
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
    );
  });

  const preemCards = children.map((preemWithContributions) => {
    const { preem, children } = preemWithContributions;
    if (!preem) {
      return null;
    }
    return (
      <PreemCard key={preem.id} preem={preem} contributions={children}>
        <Button
          variant="filled"
          color="yellow"
          size="xs"
          onClick={() => setSelectedPreem(preem)}
          leftSection={<IconCurrencyDollar size={14} />}
          fullWidth
          mt="md"
        >
          Contribute
        </Button>
      </PreemCard>
    );
  });

  const contributionItems = allContributions.map((c) => {
    const contributor = c.contributor
      ? {
          id: c.contributor.id,
          path: c.contributor.path,
          name: c.contributor.name,
          avatarUrl: c.contributor.avatarUrl,
        }
      : {
          id: undefined,
          path: undefined,
          name: 'Anonymous',
          avatarUrl: 'https://placehold.co/40x40.png',
        };
    return (
      <Box key={c.path} mb="md">
        <Group>
          {contributor.path && <UserAvatarIcon user={contributor} />}
          <div>
            <Text size="sm">
              <Text
                component={Link}
                href={
                  contributor.path ? `/${toUrlPath(contributor.path)}` : '#'
                }
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
                href={`/${toUrlPath(c.preemPath)}`}
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
    <Container fluid>
      <MultiPanelLayout
        leftPanel={
          <RaceCard data-testid="race-details" race={race} preems={children} />
        }
        rightPanel={<CourseLink courseLink={race.courseLink} />}
        bottomPanel={
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Group justify="space-between" mb="md">
                <Title order={2}>Preems</Title>
                <Button
                  component={Link}
                  href={`/big-screen/${toUrlPath(race.path)}`}
                  variant="outline"
                  leftSection={<IconDeviceTv size={16} />}
                >
                  Big Screen
                </Button>
              </Group>
              <Card withBorder padding="md" radius="md">
                {/* Desktop view */}
                <Box visibleFrom="sm">
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
                </Box>
                {/* Mobile view */}
                <Box hiddenFrom="sm">
                  <Stack>{preemCards}</Stack>
                </Box>
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
                <Title order={2} mb="md">
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
        }
      />
      {selectedPreem && (
        <ContributionModal
          isOpen={!!selectedPreem}
          onClose={() => setSelectedPreem(null)}
          preem={{
            id: selectedPreem.id ?? '',
            path: selectedPreem.path ?? '',
            name: selectedPreem.name ?? '',
          }}
        />
      )}
    </Container>
  );
};

export default Race;
