import '@/matchMedia.mock';
import { fireEvent, render, screen } from '@/test-utils';
import { useMantineColorScheme } from '@mantine/core';
import { PreferencesPanel } from './PreferencesPanel';

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
