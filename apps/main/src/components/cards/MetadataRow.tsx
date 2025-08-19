import { Grid, Group } from '@mantine/core';
import React from 'react';

export interface MetadataItem {
  icon: React.ReactNode;
  label: React.ReactNode;
}

interface MetadataRowProps {
  items: MetadataItem[];
}

export const MetadataRow: React.FC<MetadataRowProps> = ({ items }) => {
  return (
    <Grid>
      {items.map((item, index) => (
        <Grid.Col span="auto" key={index}>
          <Group gap="xs" wrap="nowrap">
            {item.icon}
            {item.label}
          </Group>
        </Grid.Col>
      ))}
    </Grid>
  );
};
