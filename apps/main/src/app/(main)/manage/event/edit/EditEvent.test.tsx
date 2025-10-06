import userEvent from '@testing-library/user-event';

import { Event } from '@/datastore/schema';
import { act, render, screen, waitFor } from '@/test-utils';

import { EditEvent } from './EditEvent';

const mockEvent: Event = {
  id: 'event-1',
  path: 'organizations/org-1/series/series-1/events/event-1',
  name: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date(),
  endDate: new Date(),
  timezone: 'America/New_York',
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
};

describe('EditEvent component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call editEventAction with the correct data on form submission', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const editEventAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditEvent event={mockEvent} editEventAction={editEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Event Name');

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editEventAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1/events/event-1',
          edits: expect.objectContaining({
            name: 'New Event Name',
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
    const editEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditEvent event={mockEvent} editEventAction={editEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Event Name');

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });

  it('should open a modal to add a new race', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<EditEvent event={mockEvent} editEventAction={jest.fn()} />);

    const addRaceButton = screen.getByText('Add Race');
    await act(async () => {
      await user.click(addRaceButton);
    });

    const modalTitle = await screen.findByText('Add Race');
    expect(modalTitle).toBeInTheDocument();
  });
});
