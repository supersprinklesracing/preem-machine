'use client';

import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, setupTimeMocking } from '@/test-utils';

import { useMainAppShell } from './MainAppShellContext';
import { MainAppShellProvider } from './MainAppShellProvider';

// A consumer component to test the context values
const TestConsumer = () => {
  const { isMobile, isSidebarOpened, toggleSidebar, onLinkClick } =
    useMainAppShell();
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
  return jest.fn(({ children }) => (
    <div data-testid="main-app-shell">{children}</div>
  ));
});

describe('MainAppShellProvider', () => {
  setupTimeMocking();

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('provides the correct initial context values', () => {
    render(
      <MainAppShellProvider>
        <TestConsumer />
      </MainAppShellProvider>,
    );

    expect(screen.getByTestId('isMobile')).toHaveTextContent('false');
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');
  });

  it('toggles the sidebar state when toggleSidebar is called', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <MainAppShellProvider>
        <TestConsumer />
      </MainAppShellProvider>,
    );

    const toggleButton = screen.getByTestId('toggleSidebar');

    // Sidebar is initially closed
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');

    // Click to open
    await user.click(toggleButton);
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('true');

    // Click to close
    await user.click(toggleButton);
    expect(screen.getByTestId('isSidebarOpened')).toHaveTextContent('false');
  });
});