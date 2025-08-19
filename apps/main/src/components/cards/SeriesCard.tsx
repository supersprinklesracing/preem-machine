import { SeriesWithEvents } from '@/datastore/firestore';
import { Card, Grid, Group, Stack, Title } from '@mantine/core';
import React from 'react';
import { DateLocationDetail } from './DateLocationDetail';

interface SeriesCardProps {
  series: SeriesWithEvents;
  children?: React.ReactNode;
}

export default function SeriesCard({ series, children }: SeriesCardProps) {
  const dateLocationDetailContent = (
    <DateLocationDetail
      startDate={series.startDate}
      endDate={series.endDate}
      location={series.location}
    />
  );

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
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title
                    order={3}
                    ff="Space Grotesk, var(--mantine-font-family)"
                  >
                    {series.name}
                  </Title>
                </div>
              </Group>
              <Group mt="md" mb="md" hiddenFrom="lg">
                {dateLocationDetailContent}
              </Group>
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
