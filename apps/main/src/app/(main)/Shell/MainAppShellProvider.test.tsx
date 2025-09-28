'use client';

import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import MainAppShellProvider from './MainAppShellProvider';
import { useMainAppShell } from './MainAppShellContext';

// A consumer component to test the context values
const TestConsumer = () => {
  const { isMobile, isSidebarOpened, toggleSidebar, onLinkClick } = useMainAppShell();
  return (
    <div>
      <div data-testid="isMobile">{isMobile.toString()}</div>
      <div data-testid="isSidebarOpened">{isSidebarOpened.toString()}</div>
      <button type="button" onClick={toggleSidebar} data-testid="toggleSidebar">
        Toggle Sidebar
      </button>
      <button type="button" onClick={onLinkClick} data-testid="onLinkClick">
        Link Click
      </button>
    </div>
  );
};

// Mock MainAppShell to isolate the provider's functionality
jest.mock('./MainAppShell', () => {
  return jest.fn(({ children }) => <div data-testid="main-app-shell">{children}</div>);
});

describe('MainAppShellProvider', () => {
  it('provides the correct initial context values', () => {
    render(
      <MainAppShellProvider>
        <TestConsumer />
      </MainAppShellProvider>,
    );

    expect(screen.getByTestId('isMobile')).toHaveTextContent('false');
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');
  });

  it('toggles the sidebar state when toggleSidebar is called', () => {
    render(
      <MainAppShellProvider>
        <TestConsumer />
      </MainAppShellProvider>,
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