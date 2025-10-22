import { Grid, Stack } from '@mantine/core';
import { ReactNode } from 'react';

export function CommonLayout({
  children,
  breadcrumb,
  title,
}: {
  children: ReactNode;
  breadcrumb?: ReactNode;
  title?: ReactNode;
}) {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 9, lg: 9 }}>
        <Stack>
          {breadcrumb}
          {title}
          {children}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
