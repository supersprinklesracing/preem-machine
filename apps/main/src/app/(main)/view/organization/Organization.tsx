'use client';

import {
  Anchor,
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

import { SeriesCard } from '@/components/cards/SeriesCard';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { toUrlPath } from '@/datastore/paths';
import {
  Contribution,
  Event,
  Organization as OrganizationType,
  Preem,
  Race,
  Series,
  User,
} from '@/datastore/schema';

interface Props {
  organization: Pick<
    OrganizationType,
    'id' | 'name' | 'description' | 'website'
  >;
  serieses: {
    series: Series;
    children: {
      event: Pick<Event, 'id' | 'path'>;
      children: {
        race: Pick<Race, 'id' | 'path'>;
        children: {
          preem: Pick<Preem, 'id' | 'path'>;
          children: Pick<Contribution, 'id'>[];
        }[];
      }[];
    }[];
  }[];
  members: Pick<
    User,
    'id' | 'avatarUrl' | 'name' | 'email' | 'organizationRefs' | 'path'
  >[];
}

export function Organization({ organization, serieses, members }: Props) {
  const memberRows = members.map((member) => (
    <Table.Tr key={member.id}>
      <Table.Td>
        <UserAvatar user={member} />
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
    <MultiPanelLayout>
      <Stack>
        <Title>{organization.name}</Title>
        {organization.description && (
          // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
          <div dangerouslySetInnerHTML={{ __html: organization.description }} />
        )}
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
                <SeriesCard key={series.path} series={series}>
                  <Button
                    component={Link}
                    href={`/view/${toUrlPath(series.path)}`}
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
    </MultiPanelLayout>
  );
}
