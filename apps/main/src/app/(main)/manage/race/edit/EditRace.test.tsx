import userEvent from '@testing-library/user-event';

import { Race } from '@/datastore/schema';
import { act, render, screen, waitFor } from '@/test-utils';

import { EditRace } from './EditRace';

jest.mock('@/components/forms/RichTextEditor', () => ({
  RichTextEditor: (props: any) => (
    <textarea
      data-testid={props['data-testid'] || 'description-input'}
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    />
  ),
}));

const mockRace: Race = {
  id: 'race-1',
  path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
  name: 'Test Race',
  location: 'Test Location',
  website: 'https://example.com',
  courseLink: 'https://strava.com/routes/123',
  description: 'Test Description',
  courseDetails: 'Test Course Details',
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
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const editRaceAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditRace race={mockRace} editRaceAction={editRaceAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Race');
    const courseLinkInput = screen.getByDisplayValue(
      'https://strava.com/routes/123',
    );
    const descriptionInput = screen.getByDisplayValue('Test Description');
    const courseDetailsInput = screen.getByDisplayValue('Test Course Details');

    await user.clear(nameInput);
    await user.type(nameInput, 'New Race Name');
    await user.clear(courseLinkInput);
    await user.type(courseLinkInput, 'https://strava.com/routes/456');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'New Description');
    await user.clear(courseDetailsInput);
    await user.type(courseDetailsInput, 'New Course Details');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editRaceAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          edits: expect.objectContaining({
            name: 'New Race Name',
            courseLink: 'https://strava.com/routes/456',
            description: 'New Description',
            courseDetails: 'New Course Details',
            timezone: 'America/New_York',
          }),
        }),
      );
    });
  });

  it('should display an error message if the action fails', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const editRaceAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditRace race={mockRace} editRaceAction={editRaceAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Race');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Race Name');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });
});
