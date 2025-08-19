import { EventWithRaces } from '@/datastore/firestore';
import { Card, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { IconCurrencyDollar, IconUsers } from '@tabler/icons-react';
import { DateLocationDetail } from './DateLocationDetail';
import { MetadataItem, MetadataRow } from './MetadataRow';

export interface EventCardProps {
  event: EventWithRaces;
  children?: React.ReactNode;
}

export default function EventCard({ event, children }: EventCardProps) {
  const totalCollected = (event.races ?? []).reduce(
    (sum, race) =>
      sum +
      (race.preems ?? []).reduce((pSum, p) => pSum + (p.prizePool ?? 0), 0),
    0
  );

  const totalContributors = new Set(
    (event.races ?? []).flatMap((r) =>
      (r.preems ?? []).flatMap((p) =>
        (p.contributions ?? []).map((c) => c.contributor?.id).filter(Boolean)
      )
    )
  ).size;

  const dateLocationDetailContent = (
    <DateLocationDetail startDate={event.startDate} location={event.location} />
  );

  const metadataItems: MetadataItem[] = [
    {
      icon: <IconCurrencyDollar size={16} />,
      label: (
        <Text size="sm" c="green" fw={600}>
          ${totalCollected.toLocaleString()}
        </Text>
      ),
    },
    {
      icon: <IconUsers size={16} />,
      label: <Text size="sm">{totalContributors} Contributors</Text>,
    },
  ];

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Grid style={{ flexGrow: 1 }}>
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Title order={3}>{event.name}</Title>
              <Group mt="md" mb="md" hiddenFrom="lg">
                {dateLocationDetailContent}
              </Group>
              <MetadataRow items={metadataItems} />
            </div>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 3 }}>
          <Stack
            align="stretch"
            justify="space-between"
            style={{ height: '100%' }}
          >
            <Stack visibleFrom="lg" gap="xs">
              {dateLocationDetailContent}
            </Stack>
            {children}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
