import type { Event } from '@/datastore/schema';
import { Card, Grid, Group, Stack, Title, TitleOrder } from '@mantine/core';
import React from 'react';
import DateStatusBadge from '../DateStatusBadge';
import { DateLocationDetail } from './DateLocationDetail';

interface EventCardProps {
  event: Event;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
  const dateLocationDetailContent = <DateLocationDetail {...event} />;

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
                  <Group align="center" gap="md">
                    <Title order={titleOrder}>{event.name}</Title>
                    <DateStatusBadge {...event} />
                  </Group>
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

export default EventCard;
