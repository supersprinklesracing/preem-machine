'use client';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from '@mantine/core';
import type { ComponentProps } from 'react';
import React, { useCallback } from 'react';
import MainAppShell from './MainAppShell';
import Sidebar from './Sidebar';
import { AppShellContext } from './AppShellContext';

export default function AppShellProvider({
  children,
  avatarCluster,
  sidebar,
}: {
  children: React.ReactNode;
  avatarCluster?: React.ReactElement;
  sidebar?: React.ReactElement<ComponentProps<typeof Sidebar>>;
}) {
  const [isSidebarOpened, { toggle: toggleSidebar }] = useDisclosure();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      toggleSidebar();
    }
  }, [isMobile, toggleSidebar]);

  return (
    <AppShellContext.Provider value={{ onLinkClick: handleLinkClick }}>
      <MainAppShell
        isSidebarOpened={isSidebarOpened}
        toggleSidebar={toggleSidebar}
        avatarCluster={avatarCluster}
        sidebar={sidebar}
      >
        {children}
      </MainAppShell>
    </AppShellContext.Provider>
  );
}
