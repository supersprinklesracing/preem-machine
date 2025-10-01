'use client';

import { AppShell, Box, Burger, Group, Title, useMantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useMainAppShell } from './MainAppShellContext';

export function MainAppShell({
  children,
  avatarCluster,
  sidebar,
}: {
  children: React.ReactNode;
  avatarCluster?: React.ReactElement;
  sidebar?: React.ReactElement;
}) {
  const { isSidebarOpened, toggleSidebar } = useMainAppShell();
  const theme = useMantineTheme();

  return (
    <AppShell
      header={{ height: theme.other.appShell.headerHeight }}
      navbar={{
        width: theme.other.appShell.navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !isSidebarOpened, desktop: false },
      }}
      padding="md"
    >
      <Notifications />
      <AppShell.Header>
        <Group px={{ base: 'xs', sm: 'md' }} justify="space-between" h="100%">
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
                <Box visibleFrom="sm">
                  <Image
                    src="/logo.png"
                    alt="App Logo"
                    width={48}
                    height={48}
                    priority
                  />
                </Box>
                <Title order={3}>
                  Preem Machine
                </Title>
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
