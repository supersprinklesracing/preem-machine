'use client';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
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
    <MainAppShell
      opened={opened}
      toggle={toggle}
      avatarCluster={avatarCluster}
      sidebar={sidebarWithClickHandler}
    >
      {children}
    </MainAppShell>
  );
}
