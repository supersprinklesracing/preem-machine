'use client';

import { toUrlPath } from '@/datastore/paths';
export const dynamic = 'force-dynamic';

import { Button, Card, Grid, Group, Stack, Text, Title } from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconDeviceTv,
  IconPencil,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import type { ContributionWithUser } from '@/datastore/query-schema';
import { Preem } from '@/datastore/schema';
import { formatDateRelative } from '@/dates/dates';

import { ManagePreemContributionTable } from './ManagePreemContributionTable';

export interface LivePreemProps {
  preem: Preem;
  children: ContributionWithUser[];
}

export function LivePreem({ preem, children }: LivePreemProps) {
  return (
    <MultiPanelLayout>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title>{preem.name}</Title>
          <Button
            variant="outline"
            leftSection={<IconPencil size={14} />}
            size="xs"
            component={Link}
            href={`/manage/${toUrlPath(preem.path)}/edit`}
          >
            Edit Preem
          </Button>
        </Group>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder padding="lg" radius="md">
              <Title order={3}>Preem Control</Title>
              <Title order={2} mt="sm">
                {preem.name}
              </Title>
              <Group gap="xs" mt="sm">
                <IconClock size={16} />
                <Text size="sm" c="dimmed">
                  {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                  Live for {formatDateRelative(preem.timeLimit!)}
                </Text>
              </Group>
              <Group gap="xs" mt="xs">
                <IconUsers size={16} />
                <Text size="sm" c="dimmed">
                  {children.length} contributors
                </Text>
              </Group>
              <Button
                component={Link}
                href={`/big-screen/${toUrlPath(preem.path)}`}
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
            </Card>
          </Grid.Col>
        </Grid>

        <ManagePreemContributionTable children={children} />
      </Stack>
    </MultiPanelLayout>
  );
}
