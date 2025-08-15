'use client';

import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import Link from 'next/link';
import React from 'react';

export default function MainAppShell({
  children,
  header,
  sidebar,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <Notifications />
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Title order={3} ff="Space Grotesk, var(--mantine-font-family)">
                Preem Machine
              </Title>
            </Link>
          </Group>
          {header}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">{sidebar}</AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
