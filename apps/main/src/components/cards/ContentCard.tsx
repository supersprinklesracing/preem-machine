'use client';

import {
  Card,
  Grid,
  Group,
  Stack,
  Title,
  TitleOrder,
  Text,
  Box,
} from '@mantine/core';
import React from 'react';

interface ContentCardProps {
  title: React.ReactNode;
  statusBadge?: React.ReactNode;
  subheadings?: React.ReactNode[];
  mainContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  rightColumnTop?: React.ReactNode;
  rightColumnBottom?: React.ReactNode;
  style?: React.CSSProperties;
  withBorder?: boolean;
  titleOrder?: TitleOrder;
  'data-testid'?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  statusBadge,
  subheadings,
  mainContent,
  bottomContent,
  rightColumnTop,
  rightColumnBottom,
  style,
  withBorder = true,
  titleOrder = 3,
  'data-testid': dataTestId,
}) => {
  return (
    <Card
      data-testid={dataTestId}
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
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack justify="space-between" style={{ height: '100%' }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group align="center" gap="md">
                    <Title order={titleOrder}>{title}</Title>
                    {statusBadge}
                  </Group>
                  {subheadings?.map((sub, index) => (
                    <Text key={index} c="dimmed" component="div">
                      {sub}
                    </Text>
                  ))}
                </div>
              </Group>
              {mainContent}
            </div>
            {bottomContent}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack
            align="stretch"
            justify="space-between"
            style={{ height: '100%' }}
          >
            <Box visibleFrom="lg">
              <Stack gap="xs">{rightColumnTop}</Stack>
            </Box>
            {rightColumnBottom}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};
