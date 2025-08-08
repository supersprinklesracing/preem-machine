'use client';

import { AppShell, Group, Title } from '@mantine/core';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} footer={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Title>Preem Machine</Title>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer p="md" />
    </AppShell>
  );
}
