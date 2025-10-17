import { useMantineColorScheme } from '@mantine/core';
import userEvent from '@testing-library/user-event';

import { render, screen, setupTimeMocking } from '@/test-utils';

import { PreferencesPanel } from './PreferencesPanel';

// Mock @mantine/core
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  useMantineColorScheme: jest.fn(),
}));

const mockSetColorScheme = jest.fn();

describe('PreferencesPanel component', () => {
  setupTimeMocking();

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

  it('should call setColorScheme when a new color scheme is selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PreferencesPanel />);

    // The SegmentedControl renders radio buttons
    await user.click(screen.getByRole('radio', { name: 'Light' }));

    expect(mockSetColorScheme).toHaveBeenCalledWith('light');
  });
});