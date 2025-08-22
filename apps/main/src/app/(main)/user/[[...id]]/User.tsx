'use client';

import { useAuth } from '@/auth/AuthContext';
import type { ClientCompat, Contribution, User } from '@/datastore/types';
import {
  Avatar,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconEdit, IconMail, IconSettings } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';

export interface UserPageData {
  user: ClientCompat<User>;
  contributions: ClientCompat<Contribution>[];
}

interface Props {
  data: UserPageData;
}

const User: React.FC<Props> = ({ data }) => {
  const { user, contributions } = data;
  const { authUser } = useAuth();
  const isOwnProfile = authUser?.uid === user.id;

  const totalContributed = contributions.reduce(
    (sum, c) => sum + (c.amount ?? 0),
    0,
  );

  const contributionRows = contributions
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .map((c) => (
      <Table.Tr key={c.id}>
        <Table.Td>{c.date ? format(new Date(c.date), 'PP') : 'N/A'}</Table.Td>
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
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Card withBorder padding="lg" radius="md">
          <Stack align="center" ta="center">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size={120}
              radius="50%"
            />
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              {user.name}
            </Title>
            <Group gap="xs">
              <IconMail size={16} />
              <Text c="dimmed">{user.email}</Text>
            </Group>
            {isOwnProfile ? (
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                mt="md"
                leftSection={<IconEdit size={14} />}
              >
                Edit Profile
              </Button>
            )}
            <Stack gap={0} mt="md">
              <Text c="dimmed" size="sm">
                Total Contributed
              </Text>
              <Title order={3} c="blue">
                ${totalContributed.toLocaleString()}
              </Title>
            </Stack>
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Title order={1} ff="Space Grotesk, var(--mantine-font-family)" mb="lg">
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
  );
};

export default User;
