import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import { PreferencesPanel } from './PreferencesPanel';
import { useMantineColorScheme } from '@mantine/core';
import '../../../matchMedia.mock';

// Mock @mantine/core
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  useMantineColorScheme: jest.fn(),
}));

const mockSetColorScheme = jest.fn();

describe('PreferencesPanel component', () => {
  beforeEach(() => {
    (useMantineColorScheme as jest.Mock).mockReturnValue({
      colorScheme: 'auto',
      setColorScheme: mockSetColorScheme,
    });
    mockSetColorScheme.mockClear();
  });

  it('should render the preferences panel', () => {
    render(<PreferencesPanel />);
    expect(
      screen.getByRole('heading', { name: 'Preferences' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('should call setColorScheme when a new color scheme is selected', () => {
    render(<PreferencesPanel />);

    // The SegmentedControl renders radio buttons
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(mockSetColorScheme).toHaveBeenCalledWith('light');
  });
});
