import { render, screen, fireEvent, act } from '@/test-utils';
import React from 'react';
import { CreateRace } from './CreateRace';
import '@/matchMedia.mock';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('CreateRace component', () => {
  it('should call createRaceAction with the correct data on form submission', async () => {
    const createRaceAction = jest.fn(() =>
      Promise.resolve({ ok: true, raceId: 'new-race-id' }),
    );

    render(
      <CreateRace
        createRaceAction={createRaceAction}
        path="organizations/org-1/series/series-1/events/event-1"
      />,
    );

    // Fill out the form
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Race' } });

    const locationInput = screen.getByTestId('location-input');
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });

    // Select the date
    fireEvent.click(
      screen.getByRole('button', { name: /race date 1 august 2025/i }),
    );

    // Click the create button
    const createButton = screen.getByRole('button', { name: /create race/i });
    fireEvent.click(createButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(createRaceAction).toHaveBeenCalledWith(
      'organizations/org-1/series/series-1/events/event-1',
      expect.objectContaining({
        name: 'New Test Race',
        location: 'Test Location',
        date: new Date('2025-08-01'),
      }),
    );
  });
});
