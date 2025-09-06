import type { ClientCompat, Event } from '@/datastore/types';
import '@/matchMedia.mock';
import { fireEvent, render, screen, waitFor } from '@/test-utils';
import { EditEvent } from './EditEvent';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockEvent: ClientCompat<Event> = {
  id: 'event-1',
  path: 'organizations/org-1/series/series-1/events/event-1',
  name: 'Test Event',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date().toISOString(),
  seriesBrief: {
    id: 'series-1',
    path: 'organizations/org-1/series/series-1',
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
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

  it('should call updateEventAction with the correct data on form submission', async () => {
    const updateEventAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(<EditEvent event={mockEvent} editEventAction={updateEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    fireEvent.change(nameInput, { target: { value: 'New Event Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await waitFor(() => {
      expect(updateEventAction).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'organizations/org-1/series/series-1/events/event-1',
          edits: expect.objectContaining({
            name: 'New Event Name',
          }),
        }),
      );
    });

    // Assert that the action was called with the correct data
    expect(updateEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'organizations/org-1/series/series-1/events/event-1',
        edits: expect.objectContaining({
          name: 'New Event Name',
        }),
      }),
    );
  });

  it('should display an error message if the action fails', async () => {
    const updateEventAction = jest.fn(() =>
      Promise.reject(new Error('Failed to save')),
    );

    render(<EditEvent event={mockEvent} editEventAction={updateEventAction} />);

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    fireEvent.change(nameInput, { target: { value: 'New Event Name' } });

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
