import type { ClientCompat, Series } from '@/datastore/types';
import { Card, Grid, Group, Stack, Title, TitleOrder } from '@mantine/core';
import React from 'react';
import { DateLocationDetail } from './DateLocationDetail';

interface SeriesCardProps {
  series: ClientCompat<Series>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  const dateLocationDetailContent = <DateLocationDetail {...series} />;

  return (
    <Card
      withBorder={withBorder}
      padding="lg"
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style,
      }}
    >
      <Grid gutter="lg" style={{ flexGrow: 1 }}>
        <Grid.Col span={{ base: 12, lg: 9 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={titleOrder}>{series.name}</Title>
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
};

export default SeriesCard;
