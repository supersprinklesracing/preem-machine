'use client';

import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import AppShellProvider from './AppShellProvider';
import { useAppShell } from './AppShellContext';
import MainAppShell from './MainAppShell';

// A consumer component to test the context values
const TestConsumer = () => {
  const { isMobile, isSidebarOpened, toggleSidebar, onLinkClick } = useAppShell();
  return (
    <div>
      <div data-testid="isMobile">{isMobile.toString()}</div>
      <div data-testid="isSidebarOpened">{isSidebarOpened.toString()}</div>
      <button onClick={toggleSidebar} data-testid="toggleSidebar">
        Toggle Sidebar
      </button>
      <button onClick={onLinkClick} data-testid="onLinkClick">
        Link Click
      </button>
    </div>
  );
};

// Mock MainAppShell to isolate the provider's functionality
jest.mock('./MainAppShell', () => {
  return jest.fn(({ children }) => <div data-testid="main-app-shell">{children}</div>);
});

describe('AppShellProvider', () => {
  it('provides the correct initial context values', () => {
    render(
      <AppShellProvider>
        <TestConsumer />
      </AppShellProvider>,
    );

    expect(screen.getByTestId('isMobile')).toHaveTextContent('false');
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');
  });

  it('toggles the sidebar state when toggleSidebar is called', () => {
    render(
      <AppShellProvider>
        <TestConsumer />
      </AppShellProvider>,
    );

    const toggleButton = screen.getByTestId('toggleSidebar');

    // Sidebar is initially closed
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');

    // Click to open
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('true');

    // Click to close
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');
  });
});