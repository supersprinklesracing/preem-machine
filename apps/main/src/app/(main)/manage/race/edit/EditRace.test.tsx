import { Race } from '@/datastore/schema';
import { act, fireEvent, render, screen, waitFor } from '@/test-utils';

import { EditRace } from './EditRace';

const mockRace: Race = {
  id: 'race-1',
  path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
  name: 'Test Race',
  location: 'Test Location',
  website: 'https://example.com',
  courseLink: 'https://strava.com/routes/123',
  startDate: new Date(),
  endDate: new Date(),
  timezone: 'America/New_York',
  eventBrief: {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event 1',
    seriesBrief: {
      id: 'series-1',
      path: 'organizations/org-1/series/series-1',
      name: 'Test Series 1',
      organizationBrief: {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Organization 1',
      },
    },
  },
};

describe('EditRace component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call editRaceAction with the correct data on form submission', async () => {
    const editRaceAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditRace race={mockRace} editRaceAction={editRaceAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Race');
    fireEvent.change(nameInput, { target: { value: 'New Race Name' } });

    // Change the course link in the form
    const courseLinkInput = screen.getByDisplayValue(
      'https://strava.com/routes/123',
    );
    fireEvent.change(courseLinkInput, {
      target: { value: 'https://strava.com/routes/456' },
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editRaceAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          edits: expect.objectContaining({
            name: 'New Race Name',
            courseLink: 'https://strava.com/routes/456',
            timezone: 'America/New_York',
          }),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const editRaceAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditRace race={mockRace} editRaceAction={editRaceAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Race');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Race Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
