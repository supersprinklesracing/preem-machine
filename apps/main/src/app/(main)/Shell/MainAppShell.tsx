'use client';

import { AppShell, Burger, Group, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import React from 'react';
import Sidebar from './Sidebar';

export default function MainAppShell({
  children,
  avatarCluster,
  sidebar,
  isSidebarOpened,
  toggleSidebar,
}: {
  children: React.ReactNode;
  avatarCluster?: React.ReactElement;
  sidebar?: React.ReactElement<ComponentProps<typeof Sidebar>>;
  isSidebarOpened: boolean;
  toggleSidebar: () => void;
}) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !isSidebarOpened, desktop: false },
        hidden: isMobile ? !isSidebarOpened : undefined,
      }}
      padding="md"
    >
      <Notifications />
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={isSidebarOpened}
              onClick={toggleSidebar}
              hiddenFrom="sm"
              size="sm"
              title="Open navigation"
              data-testid="sidebar-burger"
              aria-expanded={isSidebarOpened}
            />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group>
                <Image src="/logo.png" alt="App Logo" width={48} height={48} priority />
                <Title order={3}>Preem Machine</Title>
              </Group>
            </Link>
          </Group>
          {avatarCluster}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">{sidebar}</AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
