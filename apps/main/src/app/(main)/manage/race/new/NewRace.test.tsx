import { render, screen, fireEvent, act, waitFor } from '@/test-utils';
import React from 'react';
import { NewRace } from './NewRace';
import '@/matchMedia.mock';
import { FormActionResult } from '@/components/forms/forms';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@mantine/dates', () => ({
  DateTimePicker: (props: any) => (
    <input
      data-testid="date-time-picker"
      onChange={(e) => props.onChange(new Date(e.target.value))}
    />
  ),
}));

describe('NewRace component', () => {
  it('should call newRaceAction with the correct data on form submission', async () => {
    const newRaceAction = jest.fn(
      (): Promise<FormActionResult<{ path?: string }>> =>
        Promise.resolve({
          type: 'success',
          message: '',
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
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'New Test Race' },
    });
    fireEvent.change(screen.getByTestId('location-input'), {
      target: { value: 'Test Location' },
    });
    fireEvent.change(screen.getByTestId('date-time-picker'), {
      target: { value: '2025-08-01T10:00:00.000Z' },
    });

    const createButton = screen.getByRole('button', { name: /create race/i });
    await waitFor(() => expect(createButton).not.toBeDisabled());

    // Click the create button
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(newRaceAction).toHaveBeenCalledWith(
        'organizations/org-1/series/series-1/events/event-1/races',
        expect.objectContaining({
          name: 'New Test Race',
          location: 'Test Location',
          date: new Date('2025-08-01T10:00:00.000Z'),
        }),
      );
    });

    expect(newRaceAction).toHaveBeenCalledWith(
      'organizations/org-1/series/series-1/events/event-1/races',
      expect.objectContaining({
        name: 'New Test Race',
        location: 'Test Location',
        date: new Date('2025-08-01T10:00:00.000Z'),
      }),
    );
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
    fireEvent.change(screen.getByTestId('date-time-picker'), {
      target: { value: '2025-08-01T10:00:00.000Z' },
    });

    const createButton = screen.getByRole('button', { name: /create race/i });
    await waitFor(() => expect(createButton).not.toBeDisabled());

    // Click the create button
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Wait for the error message to appear
    expect(await screen.findByText('Failed to create')).toBeInTheDocument();
  });
});
