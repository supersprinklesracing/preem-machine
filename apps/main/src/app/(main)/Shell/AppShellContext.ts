'use client';

import { createContext, use } from 'react';

interface AppShellContextValue {
  onLinkClick?: () => void;
  isMobile: boolean;
  isSidebarOpened: boolean;
  toggleSidebar: () => void;
}

export const AppShellContext = createContext<AppShellContextValue>({
  isMobile: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onLinkClick: () => {},
  isSidebarOpened: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleSidebar: () => {},
});

export const useAppShell = () => {
  return use(AppShellContext);
};