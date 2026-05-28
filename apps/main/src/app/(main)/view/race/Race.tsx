'use client';

import {
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

import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PreemCard } from '@/components/cards/PreemCard';
import { RaceCard } from '@/components/cards/RaceCard';
import { ContributionModal } from '@/components/ContributionModal';
import { CourseLink } from '@/components/CourseLink/CourseLink';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { PreemStatusBadge } from '@/components/PreemStatusBadge/PreemStatusBadge';
import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { getUrlPath } from '@/datastore/paths';
import { PreemWithContributions } from '@/datastore/query-schema';
import { Preem, Race as RaceType } from '@/datastore/schema';
import { getSponsorName } from '@/datastore/sponsors';
import { compareDates } from '@/dates/dates';

interface Props {
  race: RaceType;
  children: PreemWithContributions[];
}

export function Race({ race, children }: Props) {
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

    .sort((a, b) => compareDates(a.contribution.date, b.contribution.date));

  const preemRows = children.map((preemWithContributions) => {
    const { preem } = preemWithContributions;
    if (!preem) {
      return null;
    }
    return (
      <Table.Tr key={preem.id}>
        <Table.Td>
          <Link
            href={getUrlPath('/view', preem.path)}
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
              data-testid={`contribute-button-${preem.id}`}
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
          data-testid={`contribute-button-mobile-${preem.id}`}
        >
          Contribute
        </Button>
      </PreemCard>
    );
  });

  const contributionItems = allContributions.map((c) => {
    const contributor = c.contributor
      ? {
          id: c.contribution.userId ?? '',
          path: c.contribution.userId
            ? `users/${c.contribution.userId}`
            : undefined,
          name: c.contributor.name || 'Anonymous',
          avatarUrl: c.contributor.avatarUrl,
        }
      : {
          id: '',
          path: undefined,
          name: 'Anonymous',
          avatarUrl: 'https://placehold.co/40x40.png',
        };
    return (
      <Box key={c.contribution.path} mb="md">
        <Group>
          {contributor.path && <UserAvatarIcon user={contributor} />}
          <div>
            <Text size="sm">
              <Text
                component={Link}
                href={
                  contributor.path ? getUrlPath('/view', contributor.path) : '#'
                }
                fw={600}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {contributor.name}
              </Text>{' '}
              contributed{' '}
              <Text span fw={600} c="green">
                ${c.contribution.amount}
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              to{' '}
              <Text
                component={Link}
                href={getUrlPath('/view', c.preemPath)}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                &quot;{c.preemName}&quot;
              </Text>
            </Text>
            {c.contribution.message && (
              <Card withBorder padding="xs" mt="xs">
                <Text size="xs" fs="italic">
                  &quot;{c.contribution.message}&quot;
                </Text>
              </Card>
            )}
          </div>
        </Group>
      </Box>
    );
  });

  return (
    <>
      <MultiPanelLayout
        topLeft={
          <RaceCard data-testid="race-details" race={race} preems={children} />
        }
        topRight={<CourseLink courseLink={race.courseLink} />}
        children={
          <Grid gap="xl">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Group justify="space-between" mb="md">
                <Title order={2}>Preems</Title>
                <Button
                  component={Link}
                  href={getUrlPath('/big-screen', race.path)}
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
    </>
  );
}
