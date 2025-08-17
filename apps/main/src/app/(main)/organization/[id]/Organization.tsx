'use client';

import SeriesCard from '@/components/SeriesCard';
import type {
  ClientCompat,
  Organization,
  Series,
  User,
} from '@/datastore/types';
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
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export interface OrganizationPageData {
  organization: ClientCompat<Organization>;
  serieses: ClientCompat<Series>[];
  members: ClientCompat<User>[];
}

interface Props {
  data: OrganizationPageData;
}

export default function Organization({ data }: Props) {
  const { organization, serieses, members } = data;

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
            member.organizationRefs?.find((ref) => ref.id === organization.id)
              ? 'member'
              : '' // Role is not stored on the user document
          }
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Title>{data.organization.name}</Title>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <Title order={2} ff="Space Grotesk, var(--mantine-font-family)">
              Race Series
            </Title>
            {serieses.map((s) => (
              <SeriesCard key={s.id} series={s}>
                <Button
                  component={Link}
                  href={`/series/${s.id}`}
                  variant="light"
                  rightSection={<IconChevronRight size={16} />}
                >
                  View Series
                </Button>
              </SeriesCard>
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
    </Stack>
  );
}
