'use client';

import {
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconMail, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { UserAvatarIcon } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import type {
  Contribution,
  Organization,
  User as UserType,
} from '@/datastore/schema';
import { compareDates, formatDateShort } from '@/dates/dates';
import { useUserContext } from '@/user/client/UserContext';

interface Props {
  user: Pick<
    UserType,
    | 'id'
    | 'path'
    | 'name'
    | 'email'
    | 'avatarUrl'
    | 'affiliation'
    | 'raceLicenseId'
  >;
  contributions: Pick<
    Contribution,
    'id' | 'path' | 'date' | 'amount' | 'preemBrief'
  >[];
  organizations: Pick<Organization, 'id' | 'path' | 'name'>[];
}

export function User({ user, contributions, organizations }: Props) {
  const { authUser } = useUserContext();
  const isOwnProfile = authUser?.uid === user.id;

  const totalContributed = contributions.reduce(
    (sum, c) => sum + (c.amount ?? 0),
    0,
  );

  const contributionRows = contributions
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .sort((a, b) => compareDates(a.date!, b.date!))
    .map((c) => (
      <Table.Tr key={c.path}>
        <Table.Td>
          {formatDateShort(c.date, c.preemBrief?.raceBrief?.timezone)}
        </Table.Td>
        <Table.Td>{c.preemBrief?.raceBrief?.name}</Table.Td>
        <Table.Td>{c.preemBrief?.name}</Table.Td>
        <Table.Td>
          <Text ta="right" c="green" fw={600}>
            ${(c.amount ?? 0).toLocaleString()}
          </Text>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <MultiPanelLayout>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Stack align="center" ta="center">
              <UserAvatarIcon user={user} size="xl" />
              <Title order={2}>{user.name}</Title>
              <Group gap="xs" wrap="nowrap">
                <IconMail size={16} />
                <Text c="dimmed">{user.email}</Text>
              </Group>

              {user.affiliation && <Text>Affiliation: {user.affiliation}</Text>}
              {user.raceLicenseId && (
                <Text>Race License ID: {user.raceLicenseId}</Text>
              )}
              {organizations && (
                <Stack>
                  {organizations.map((org) => (
                    <Text key={org.path}>
                      <Link href={`/view/${toUrlPath(org.path)}`}>
                        {org.name}
                      </Link>
                    </Text>
                  ))}
                </Stack>
              )}
              <Stack gap={0} mt="md">
                <Text c="dimmed" size="sm">
                  Total Contributed
                </Text>
                <Title order={3} c="blue">
                  ${totalContributed.toLocaleString()}
                </Title>
              </Stack>
              {isOwnProfile && (
                <Button
                  component={Link}
                  href="/account"
                  variant="outline"
                  size="sm"
                  mt="md"
                  leftSection={<IconSettings size={14} />}
                >
                  Go to My Account
                </Button>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Title order={1} mb="lg">
            Contribution History
          </Title>
          <Card withBorder padding={0} radius="md">
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Race</Table.Th>
                  <Table.Th>Preem</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{contributionRows}</Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
      </Grid>
    </MultiPanelLayout>
  );
}
