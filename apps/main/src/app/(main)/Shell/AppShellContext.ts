'use client';

import { createContext, use } from 'react';

interface AppShellContextValue {
  onLinkClick?: () => void;
}

export const AppShellContext = createContext<AppShellContextValue>({});

export const useAppShell = () => {
  return use(AppShellContext);
};
