'use client';

import { toUrlPath } from '@/datastore/paths';
import SeriesCard from '@/components/cards/SeriesCard';
import { SeriesWithEvents } from '@/datastore/firestore';
import { Organization, User } from '@/datastore/schema';
import {
  Anchor,
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
import { IconChevronRight, IconPlus, IconWorldWww } from '@tabler/icons-react';
import Link from 'next/link';

interface Props {
  organization: Organization;
  serieses: SeriesWithEvents[];
  members: User[];
}

export default function Organization({
  organization,
  serieses,
  members,
}: Props) {
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
      <Title>{organization.name}</Title>
      {organization.description && <Text>{organization.description}</Text>}
      {organization.website && (
        <Group gap="xs">
          <IconWorldWww size={16} />
          <Anchor href={organization.website} target="_blank" size="sm">
            Official Website
          </Anchor>
        </Group>
      )}
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <Title order={2}>Race Series</Title>
            {serieses.map(({ series }) => (
              <SeriesCard key={series.id} series={series}>
                <Button
                  component={Link}
                  href={`/${toUrlPath(series.path)}`}
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
              <Title order={2}>Members</Title>
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
