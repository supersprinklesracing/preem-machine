import { FormActionResult } from '@/components/forms/forms';

import { act, fireEvent, render, screen, waitFor, within } from '@/test-utils';
import { NewRace } from './NewRace';



describe('NewRace component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-05T12:00:00'));
    // Mock timezone offset to be UTC-7 (PDT), which matches the test's expectation.
    // getTimezoneOffset returns the difference in minutes between UTC and local time.
    // For UTC-7, the offset is 420 minutes.
    // jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(420);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const mockEvent = {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event',
    description: 'Test Event Description',
    startDate: new Date('2025-08-01T00:00:00.000Z'),
    endDate: new Date('2025-08-31T00:00:00.000Z'),
    timezone: 'America/New_York',
    seriesBrief: {
      id: 'series-1',
      path: 'organizations/org-1/series/series-1',
      name: 'Test Series',
      organizationBrief: {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Organization',
      },
    },
  };

  it('should call newRaceAction with the correct data on form submission', async () => {
    const newRaceAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          path: 'new-race-id',
        }),
    );

    render(
      <NewRace
        event={mockEvent}
        newRaceAction={newRaceAction}
        path="organizations/org-1/series/series-1/events/event-1/races"
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const websiteInput = screen.getByTestId('website-input');
    const locationInput = screen.getByTestId('location-input');
    const startDatePicker = screen.getByTestId('start-date-picker');
    const endDatePicker = screen.getByTestId('end-date-picker');

    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: 'New Test Race' },
      });
      fireEvent.change(locationInput, {
        target: { value: 'Test Location' },
      });
      fireEvent.change(websiteInput, {
        target: { value: 'https://example.com' },
      });
      fireEvent.change(descriptionInput, {
        target: { value: 'Test Description' },
      });
      fireEvent.change(startDatePicker, {
        target: { value: '2025-08-03T10:00' },
      });
      fireEvent.change(endDatePicker, {
        target: { value: '2025-08-15T14:00' },
      });
    });

    const createButton = screen.getByRole('button', { name: /create race/i });
    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(newRaceAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1/events/event-1/races',
        values: expect.objectContaining({
          name: 'New Test Race',
          location: 'Test Location',
          description: 'Test Description',
          website: 'https://example.com',
          startDate: new Date('2025-08-03T10:00:00.000Z'),
          endDate: new Date('2025-08-15T14:00:00.000Z'),
          timezone: 'America/New_York',
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
        event={mockEvent}
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
      target: { value: '2025-08-03T10:00' },
    });
    fireEvent.change(screen.getByTestId('end-date-picker'), {
      target: { value: '2025-08-15T14:00' },
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
