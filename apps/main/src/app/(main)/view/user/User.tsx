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
import { getUrlPath } from '@/datastore/paths';
import type {
  Contribution,
  Organization,
  Preem,
  Race,
  User as UserType,
} from '@/datastore/schema';
import { compareDates, formatDateShort } from '@/dates/dates';
import { useUserContext } from '@/user/client/UserContext';

interface Props {
  user: Pick<UserType, 'id' | 'path' | 'name' | 'email' | 'avatarUrl'>;
  contributions: {
    contribution: Pick<Contribution, 'id' | 'path' | 'date' | 'amount'>;
    preem?: Pick<Preem, 'name'>;
    race?: Pick<Race, 'name'>;
  }[];
  organizations: Pick<Organization, 'id' | 'path' | 'name'>[];
}

export function User({ user, contributions, organizations }: Props) {
  const { authUser } = useUserContext();
  const isOwnProfile = authUser?.uid === user.id;

  const totalContributed = contributions.reduce(
    (sum, c) => sum + (c.contribution.amount ?? 0),
    0,
  );

  const contributionRows = contributions
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .sort((a, b) => compareDates(a.contribution.date!, b.contribution.date!))
    .map((c) => (
      <Table.Tr key={c.contribution.path}>
        <Table.Td>{formatDateShort(c.contribution.date)}</Table.Td>
        <Table.Td>{c.race?.name}</Table.Td>
        <Table.Td>{c.preem?.name}</Table.Td>
        <Table.Td>
          <Text ta="right" c="green" fw={600}>
            ${(c.contribution.amount ?? 0).toLocaleString()}
          </Text>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <MultiPanelLayout>
      <Grid gap="xl">
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Stack align="center" ta="center">
              <UserAvatarIcon user={user} size="xl" />
              <Title order={2}>{user.name}</Title>
              <Group gap="xs" wrap="nowrap">
                <IconMail size={16} />
                <Text c="dimmed">{user.email}</Text>
              </Group>
              {organizations && (
                <Stack>
                  {organizations.map((org) => (
                    <Text key={org.path}>
                      <Link href={getUrlPath('/view', org.path)}>
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
