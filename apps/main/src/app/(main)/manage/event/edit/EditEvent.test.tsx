import { Event } from '@/datastore/schema';

import { act, fireEvent, render, screen, waitFor } from '@/test-utils';
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
    const editEventAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditEvent event={mockEvent} editEventAction={editEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Event Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(editEventAction).toHaveBeenCalledWith({
        path: 'organizations/org-1/series/series-1/events/event-1',
        edits: {
          name: 'New Event Name',
        },
      });
    });
  });

  it('should display an error message if the action fails', async () => {
    const editEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditEvent event={mockEvent} editEventAction={editEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Event Name' } });
      jest.advanceTimersByTime(500);
    });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the error message to appear
    await screen.findByText('Failed to save');
  });

  it('should open a modal to add a new race', async () => {
    render(<EditEvent event={mockEvent} editEventAction={jest.fn()} />);

    const addRaceButton = screen.getByText('Add Race');
    fireEvent.click(addRaceButton);

    const modalTitle = await screen.findByText('Add Race');
    expect(modalTitle).toBeInTheDocument();
  });
});
