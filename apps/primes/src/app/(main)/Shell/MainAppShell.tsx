'use client';

import { AppShell, Burger, Group, Title, useMantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
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
      <AppShell.Header
        style={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        }}
      >
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
            <Link
              href="/home"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Group>
                <Title
                  order={2}
                  c="giroOrange.5"
                  ff='"Fat Kat Regular", sans-serif'
                  lts="1px"
                >
                  Prime Machine
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
