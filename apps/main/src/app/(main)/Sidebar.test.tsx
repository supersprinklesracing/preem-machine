import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import Sidebar from './Sidebar';
import type { SidebarData } from './Sidebar';
import '../../matchMedia.mock';
import { useMediaQuery } from '@mantine/hooks';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

// Mock @mantine/hooks
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useMediaQuery: jest.fn(),
}));

const mockData: SidebarData = {
  events: [
    { id: 'event-1', name: 'Test Event 1' },
    { id: 'event-2', name: 'Test Event 2' },
  ],
};

describe('Sidebar component', () => {
  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockClear();
  });

  it('should render event links', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Default to not mobile
    render(<Sidebar data={mockData} />);
    expect(
      screen.getByRole('link', { name: 'Test Event 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test Event 2' }),
    ).toBeInTheDocument();
  });

  it('should call onLinkClick when a link is clicked on mobile', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate mobile
    const onLinkClick = jest.fn();
    render(<Sidebar data={mockData} onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onLinkClick when a link is clicked on desktop', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Simulate desktop
    const onLinkClick = jest.fn();
    render(<Sidebar data={mockData} onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).not.toHaveBeenCalled();
  });
});
