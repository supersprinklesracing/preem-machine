import { Container, SimpleGrid, Stack } from '@mantine/core';
import { ReactNode } from 'react';

export function MultiPanelLayout({
  children,
  topLeft,
  topRight,
}: {
  children?: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
}) {
  return (
    <Container fluid>
      <Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {topLeft}
          {topRight}
        </SimpleGrid>
        {children && <SimpleGrid cols={1}>{children}</SimpleGrid>}
      </Stack>
    </Container>
  );
}
