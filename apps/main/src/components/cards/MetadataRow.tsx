import { Grid, Group } from '@mantine/core';
import React from 'react';

export interface MetadataItem {
  key: string;
  icon: React.ReactNode;
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
            {item.icon}
            {item.label}
          </Group>
        </Grid.Col>
      ))}
    </Grid>
  );
};
