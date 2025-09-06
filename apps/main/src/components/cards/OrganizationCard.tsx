import type { ClientCompat, Organization } from '@/datastore/types';
import { Card, Grid, Group, Stack, Title, TitleOrder } from '@mantine/core';
import React from 'react';

interface OrganizationCardProps {
  organization: ClientCompat<Organization>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  children,
  style,
  withBorder = true,
  titleOrder = 3,
}) => {
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
                  <Title order={titleOrder}>{organization.name}</Title>
                </div>
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
            {children}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default OrganizationCard;
