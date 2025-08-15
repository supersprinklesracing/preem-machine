'use client';

import SeriesCard from '@/components/SeriesCard';
import type { Organization, RaceSeries, User } from '@/datastore/types';
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
import { IconPlus } from '@tabler/icons-react';

interface OrganizationProps {
  organization: Organization;
  series: RaceSeries[];
  members: User[];
}

export default function Organization({
  organization,
  series,
  members,
}: OrganizationProps) {
  const memberRows = members.map((member) => (
    <Table.Tr key={member.id}>
      <Table.Td>
        <Group>
          <Avatar src={member.avatarUrl} radius="xl" />
          <div>
            <Text size="sm" fw={500}>
              {member.name}
            </Text>
            <Text size="xs" c="dimmed">
              {member.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {
            member.organizationMemberships?.find(
              (m) => m.organizationId === organization.id
            )?.role
          }
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack>
          <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
            Race Series
          </Title>
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack>
          <Group justify="space-between">
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Members
            </Title>
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconPlus size={14} />}
            >
              Invite
            </Button>
          </Group>
          <Card withBorder padding={0} radius="md">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Role</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{memberRows}</Table.Tbody>
            </Table>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
