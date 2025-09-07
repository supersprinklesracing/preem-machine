import { FormActionResult } from '@/components/forms/forms';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
import { NewRace } from './NewRace';

// Mock dependencies
jest.mock('next/navigation', () => ({
  // eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NewRace component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-05T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call newRaceAction with the correct data on form submission', async () => {
    const newRaceAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          path: 'new-race-id',
        }),
    );

    render(
      <NewRace
        newRaceAction={newRaceAction}
        path="organizations/org-1/series/series-1/events/event-1/races"
      />,
    );

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'New Test Race' },
      });
      fireEvent.change(screen.getByTestId('location-input'), {
        target: { value: 'Test Location' },
      });
      fireEvent.change(screen.getByLabelText('Website'), {
        target: { value: 'https://example.com' },
      });
      fireEvent.change(screen.getByTestId('description-input'), {
        target: { value: 'Test Description' },
      });

      fireEvent.change(screen.getByTestId('start-date-picker'), {
        target: { value: '2025-08-03T10:00:00.000Z' },
      });
      fireEvent.change(screen.getByTestId('end-date-picker'), {
        target: { value: '2025-08-15T14:00:00.000Z' },
      });

      // Select a date range
      // fireEvent.click(screen.getAllByText('3')[0]);
      // fireEvent.click(screen.getAllByText('15')[0]);

      jest.advanceTimersByTime(500);
    });

    const createButton = screen.getByRole('button', { name: /create race/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newRaceAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1/events/event-1/races',
        values: expect.objectContaining({
          name: 'New Test Race',
          location: 'Test Location',
          description: 'Test Description',
          website: 'https://example.com',
          category: '',
          gender: '',
          courseDetails: '',
          maxRacers: 0,
          ageCategory: '',
          duration: '',
          laps: 0,
          podiums: 0,
          sponsors: [],
          // TODO: Fix this.
          // startDate: new Date('2025-08-03T10:00:00.000Z'),
          // endDate: new Date('2025-08-15T14:00:00.000Z'),
        }),
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const newRaceAction = jest.fn(() =>
      Promise.reject(new Error('Failed to create')),
    );

    render(
      <NewRace
        newRaceAction={newRaceAction}
        path="organizations/org-1/series/series-1/events/event-1/races"
      />,
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Race' },
    });
    fireEvent.change(screen.getByTestId('location-input'), {
      target: { value: 'Test Location' },
    });
    fireEvent.change(screen.getByLabelText('Website'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByTestId('start-date-picker'), {
      target: { value: '2025-08-03T10:00:00.000Z' },
    });
    fireEvent.change(screen.getByTestId('end-date-picker'), {
      target: { value: '2025-08-15T14:00:00.000Z' },
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Race')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create race/i });
    expect(createButton).not.toBeDisabled();

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
