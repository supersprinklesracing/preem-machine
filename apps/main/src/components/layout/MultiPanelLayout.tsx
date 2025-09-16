'use client';

import { SimpleGrid, Stack } from '@mantine/core';
import { ReactNode } from 'react';

export function MultiPanelLayout({
  leftPanel,
  rightPanel,
  bottomPanel,
}: {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  bottomPanel?: ReactNode;
}) {
  return (
    <Stack>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {leftPanel}
        {rightPanel}
      </SimpleGrid>
      {bottomPanel && <SimpleGrid cols={1}>{bottomPanel}</SimpleGrid>}
    </Stack>
  );
}
