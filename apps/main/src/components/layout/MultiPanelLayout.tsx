import { Grid } from '@mantine/core';
import React from 'react';

interface MultiPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomPanel?: React.ReactNode;
}

const MultiPanelLayout: React.FC<MultiPanelLayoutProps> = ({
  leftPanel,
  rightPanel,
  bottomPanel,
}) => {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>{leftPanel}</Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>{rightPanel}</Grid.Col>
      {bottomPanel && <Grid.Col span={12}>{bottomPanel}</Grid.Col>}
    </Grid>
  );
};

export default MultiPanelLayout;
