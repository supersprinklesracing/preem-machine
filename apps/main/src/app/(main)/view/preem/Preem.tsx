'use client';

import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconClock,
  IconCurrencyDollar,
  IconTarget,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ContributionModal } from '@/components/ContributionModal';
import { MultiPanelLayout } from '@/components/layout/MultiPanelLayout';
import { PreemStatusBadge } from '@/components/PreemStatusBadge/PreemStatusBadge';
import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { racePath, toUrlPath } from '@/datastore/paths';
import { Contribution, Preem as PreemType } from '@/datastore/schema';
import { compareDates, formatDateTime } from '@/dates/dates';

interface Props {
  preem: Pick<
    PreemType,
    | 'path'
    | 'raceBrief'
    | 'name'
    | 'description'
    | 'status'
    | 'type'
    | 'minimumThreshold'
    | 'timeLimit'
    | 'prizePool'
    | 'id'
  >;
  children: Contribution[];
}

export function Preem({ preem, children }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contributionRows = [...(children || [])]
    .sort((a, b) => compareDates(a.date ?? '', b.date ?? ''))
    .map((contribution) => {
      return (
        <Table.Tr key={contribution.path}>
          <Table.Td>
            <UserAvatar user={contribution.contributor} />
          </Table.Td>
          <Table.Td>
            <Text c="green" fw={600}>
              ${contribution.amount?.toLocaleString()}
            </Text>
          </Table.Td>
          <Table.Td>{formatDateTime(contribution.date)}</Table.Td>
          <Table.Td>
            <Text c="dimmed" fs="italic">
              {contribution.message || ''}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    });

  return (
    <>
      <MultiPanelLayout>
        <Stack gap="lg">
          <Box>
            <Button
              component={Link}
              href={`/view/${toUrlPath(racePath(preem.path))}`}
              variant="subtle"
              mb="sm"
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to {preem.raceBrief.name}
            </Button>
            <Title order={1}>{preem.name}</Title>
            <Text c="dimmed">Part of {preem.raceBrief.name}</Text>
            {preem.description && (
              <Box
                mt="md"
                // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
                dangerouslySetInnerHTML={{ __html: preem.description }}
              />
            )}
          </Box>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder padding="lg" radius="md">
                <Title order={4} mb="md">
                  Details
                </Title>
                <SimpleGrid cols={2} spacing="md">
                  <Group>
                    <PreemStatusBadge status={preem.status || 'Open'} />
                  </Group>
                  <Group gap="xs">
                    <IconUsers size={18} stroke={1.5} />
                    <Text fw={500}>{preem.type}</Text>
                  </Group>
                  {preem.minimumThreshold && (
                    <Group gap="xs">
                      <IconTarget size={18} stroke={1.5} />
                      <Text fw={500}>Threshold: ${preem.minimumThreshold}</Text>
                    </Group>
                  )}
                  {preem.timeLimit && (
                    <Group gap="xs">
                      <IconClock size={18} stroke={1.5} />
                      <Text fw={500}>
                        Ends: {formatDateTime(preem.timeLimit)}
                      </Text>
                    </Group>
                  )}
                </SimpleGrid>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                bg="dark.6"
                c="white"
                padding="lg"
                radius="md"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <Text c="dimmed">Current Prize Pool</Text>
                <Title order={1} style={{ fontSize: '3.5rem' }}>
                  $<AnimatedNumber value={preem.prizePool ?? 0} />
                </Title>
                <Button
                  color="yellow"
                  mt="md"
                  onClick={() => setIsModalOpen(true)}
                  leftSection={<IconCurrencyDollar size={18} />}
                >
                  Contribute to this Preem
                </Button>
              </Card>
            </Grid.Col>
          </Grid>

          <Card withBorder padding="lg" radius="md">
            <Title order={3}>Contribution History</Title>
            <Text c="dimmed" size="sm">
              {`${children?.length || 0} contributors have built this prize pool.`}
            </Text>
            <Table mt="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Contributor</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Message</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{contributionRows}</Table.Tbody>
            </Table>
          </Card>
        </Stack>
      </MultiPanelLayout>
      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preem={{
          id: preem.id ?? '',
          path: preem.path ?? '',
          name: preem.name ?? '',
        }}
      />
    </>
  );
}
