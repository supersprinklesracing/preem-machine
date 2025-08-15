'use client';

import ThresholdAssistantModal from '@/components/ai/threshold-assistant-modal';
import RaceCard from '@/components/RaceCard';
import type { Race, RaceSeries } from '@/datastore/types';
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconChartBar,
  IconCurrencyDollar,
  IconPlus,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import React, { useState } from 'react';
import PastEventCard from './PastEventCard';

interface OrganizerProps {
  raceSeries: RaceSeries[];
}

const Organizer: React.FC<OrganizerProps> = ({ raceSeries }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const allRaces = raceSeries.flatMap((s) => s.races);
  const upcomingEvents = allRaces.filter(
    (r) => r.status === 'Upcoming' || r.status === 'Live'
  );
  const pastEvents = allRaces.filter((r) => r.status === 'Finished');

  const totalCollected = (race: Race) =>
    race.preems.reduce((sum, preem) => sum + preem.prizePool, 0);
  const totalContributors = (race: Race) =>
    new Set(
      race.preems.flatMap((p) =>
        p.contributionHistory.map((c) => c.contributorId).filter(Boolean)
      )
    ).size;

  const upcomingEventCards = upcomingEvents.map((race) => (
    <Box key={race.id} style={{ flex: '1 1 350px', minWidth: '300px' }}>
      <RaceCard race={race} style={{ height: '100%' }}>
        <Button
          component={Link}
          href={
            race.status === 'Live'
              ? `/organizer/race/${race.id}`
              : `/race/${race.id}`
          }
          fullWidth
          mt="md"
        >
          Manage
        </Button>
      </RaceCard>
    </Box>
  ));

  const pastEventRows = pastEvents.map((race) => (
    <Table.Tr key={race.id}>
      <Table.Td>
        <Text fw={500}>{race.name}</Text>
      </Table.Td>
      <Table.Td>{format(new Date(race.dateTime), 'PP')}</Table.Td>
      <Table.Td>
        <Text c="green" fw={600}>
          ${totalCollected(race).toLocaleString()}
        </Text>
      </Table.Td>
      <Table.Td>{totalContributors(race)}</Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            component={Link}
            href={`/organizer/race/${race.id}`}
            variant="outline"
            size="xs"
            leftSection={<IconChartBar size={14} />}
          >
            View Report
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const pastEventCards = pastEvents.map((race) => (
    <PastEventCard
      key={race.id}
      race={race}
      totalCollected={totalCollected(race)}
      totalContributors={totalContributors(race)}
    />
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={1} ff="Space Grotesk, var(--mantine-font-family)">
            Organizer Hub
          </Title>
          <Text c="dimmed">Welcome, Bike Race Inc.!</Text>
        </div>
        <Group>
          <Button
            variant="light"
            onClick={() => setIsAiModalOpen(true)}
            leftSection={<IconSparkles size={16} />}
          >
            AI Threshold Assistant
          </Button>
          <Button leftSection={<IconPlus size={16} />}>Create New Event</Button>
        </Group>
      </Group>

      <section>
        <Title order={2} ff="Space Grotesk, var(--mantine-font-family)" mb="md">
          Upcoming & Live Events
        </Title>
        <Flex wrap="wrap" gap="md">
          {upcomingEventCards}
        </Flex>
      </section>

      <section>
        <Title order={2} ff="Space Grotesk, var(--mantine-font-family)" mb="md">
          Past Events
        </Title>
        <Card
          withBorder
          padding={0}
          radius="md"
          display={{ base: 'none', sm: 'block' }}
        >
          <Table.ScrollContainer minWidth={500}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event Name</Table.Th>
                  <Table.Th>
                    <Group gap="xs">
                      <IconCalendar size={16} stroke={1.5} />
                      Date
                    </Group>
                  </Table.Th>
                  <Table.Th>
                    <Group gap="xs">
                      <IconCurrencyDollar size={16} stroke={1.5} />
                      Total Preems
                    </Group>
                  </Table.Th>
                  <Table.Th>
                    <Group gap="xs">
                      <IconUsers size={16} stroke={1.5} />
                      Contributors
                    </Group>
                  </Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{pastEventRows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
        <SimpleGrid
          cols={{ base: 1, xs: 2 }}
          display={{ base: 'grid', sm: 'none' }}
        >
          {pastEventCards}
        </SimpleGrid>
      </section>
      <ThresholdAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        raceId="race-1"
      />
    </Stack>
  );
};

export default Organizer;
