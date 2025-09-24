'use client';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from '@mantine/core';
import type { ComponentProps } from 'react';
import React from 'react';
import MainAppShell from './MainAppShell';
import Sidebar from './Sidebar';

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

  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const sidebarWithClickHandler = sidebar
    ? React.cloneElement(sidebar, { onLinkClick: handleLinkClick })
    : undefined;

  return (
    <MainAppShell
      isSidebarOpened={isSidebarOpened}
      toggleSidebar={toggleSidebar}
      avatarCluster={avatarCluster}
      sidebar={sidebarWithClickHandler}
    >
      {children}
    </MainAppShell>
  );
}
