'use client';

import { createContext, use } from 'react';

interface MainAppShellContextValue {
  onLinkClick?: () => void;
  isMobile: boolean;
  isSidebarOpened: boolean;
  toggleSidebar: () => void;
}

export const MainAppShellContext = createContext<MainAppShellContextValue>({
  isMobile: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onLinkClick: () => {},
  isSidebarOpened: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleSidebar: () => {},
});

export const useMainAppShell = () => {
  return use(MainAppShellContext);
};
