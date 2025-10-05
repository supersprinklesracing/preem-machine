import { Container, Grid, Stack } from '@mantine/core';
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
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>{topLeft}</Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>{topRight}</Grid.Col>
        </Grid>
        {children && (
          <Grid>
            <Grid.Col span={12}>{children}</Grid.Col>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
