import { Group, Stack } from '@mantine/core';
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
    <Group>
      <Stack>
        {breadcrumb}
        {title}
        {children}
      </Stack>
    </Group>
  );
}
