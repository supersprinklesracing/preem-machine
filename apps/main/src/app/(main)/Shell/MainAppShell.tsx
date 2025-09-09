'use client';

import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import Link from 'next/link';
import React from 'react';
import type { ComponentProps } from 'react';
import Sidebar from './Sidebar';

export default function MainAppShell({
  children,
  avatarCluster: header,
  sidebar,
}: {
  children: React.ReactNode;
  avatarCluster?: React.ReactElement;
  sidebar?: React.ReactElement<ComponentProps<typeof Sidebar>>;
}) {
  const [opened, { toggle }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLinkClick = () => {
    if (isMobile) {
      toggle();
    }
  };

  const sidebarWithClickHandler = sidebar
    ? React.cloneElement(sidebar, { onLinkClick: handleLinkClick })
    : null;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
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
              title="Open navigation"
              data-testid="sidebar-burger"
              aria-expanded={opened}
            />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Title order={3}>Preem Machine</Title>
            </Link>
          </Group>
          {header}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">{sidebarWithClickHandler}</AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
