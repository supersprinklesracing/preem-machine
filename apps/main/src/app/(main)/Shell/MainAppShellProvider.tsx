'use client';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';
import { MainAppShellContext } from './MainAppShellContext';

export default function MainAppShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpened, { toggle: toggleSidebar }] = useDisclosure();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`, false, {
    getInitialValueInEffect: false,
  });

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      toggleSidebar();
    }
  }, [isMobile, toggleSidebar]);

  const contextValue = useMemo(
    () => ({
      onLinkClick: handleLinkClick,
      isMobile,
      isSidebarOpened,
      toggleSidebar,
    }),
    [handleLinkClick, isMobile, isSidebarOpened, toggleSidebar],
  );

  return (
    <MainAppShellContext.Provider value={contextValue}>
      {children}
    </MainAppShellContext.Provider>
  );
}