import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { theme } from '../../theme';
import AppShellProvider from './AppShellProvider';
import Sidebar from './Sidebar';

// Mock the useMediaQuery hook
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useMediaQuery: jest.fn(),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('AppShellProvider', () => {
  it('opens and closes the sidebar when the burger is clicked on mobile', () => {
    const { useMediaQuery } = require('@mantine/hooks');
    const { usePathname } = require('next/navigation');
    // Set the media query to match mobile view
    useMediaQuery.mockReturnValue(true);
    // Set the pathname to a default value
    usePathname.mockReturnValue('/');

    render(
      <MantineProvider theme={theme}>
        <AppShellProvider sidebar={<Sidebar {...{ events: [], user: null }} />}>
          <div>Page content</div>
        </AppShellProvider>
      </MantineProvider>,
    );

    // Find the burger button
    const burgerButton = screen.getByTestId('sidebar-burger');

    // Initially, the sidebar should be closed
    expect(burgerButton).toHaveAttribute('aria-expanded', 'false');

    // Click the burger button to open the sidebar
    fireEvent.click(burgerButton);
    expect(burgerButton).toHaveAttribute('aria-expanded', 'true');

    // Click the burger button again to close the sidebar
    fireEvent.click(burgerButton);
    expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens and closes the sidebar when the burger is clicked on desktop', () => {
    const { useMediaQuery } = require('@mantine/hooks');
    const { usePathname } = require('next/navigation');
    // Set the media query to match desktop view
    useMediaQuery.mockReturnValue(false);
    // Set the pathname to a default value
    usePathname.mockReturnValue('/');

    render(
      <MantineProvider theme={theme}>
        <AppShellProvider sidebar={<Sidebar {...{ events: [], user: null }} />}>
          <div>Page content</div>
        </AppShellProvider>
      </MantineProvider>,
    );

    // Find the burger button
    const burgerButton = screen.getByTestId('sidebar-burger');

    // Initially, the sidebar should be closed
    expect(burgerButton).toHaveAttribute('aria-expanded', 'false');

    // Click the burger button to open the sidebar
    fireEvent.click(burgerButton);
    expect(burgerButton).toHaveAttribute('aria-expanded', 'true');

    // Click the burger button again to close the sidebar
    fireEvent.click(burgerButton);
    expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
  });
});
