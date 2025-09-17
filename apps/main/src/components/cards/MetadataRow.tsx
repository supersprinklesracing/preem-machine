import { Grid, Group, Text } from '@mantine/core';
import React from 'react';

export interface MetadataItem {
  key: string;
  icon: (props: { size: number }) => React.ReactNode;
  label: React.ReactNode;
}

interface MetadataRowProps {
  items: MetadataItem[];
}

export const MetadataRow: React.FC<MetadataRowProps> = ({ items }) => {
  return (
    <Grid>
      {items.map((item) => (
        <Grid.Col key={item.key} span={{ base: 6, md: 4 }}>
          <Group gap="xs" wrap="nowrap">
            {item.icon({ size: 18 })}
            <Text size="sm" fw={500}>
              {item.label}
            </Text>
          </Group>
        </Grid.Col>
      ))}
    </Grid>
  );
};
