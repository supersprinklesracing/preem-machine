import type { ClientCompat, Event } from '@/datastore/types';
import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { EditEvent } from './EditEvent';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

const mockEvent: ClientCompat<Event> = {
  id: 'event-1',
  name: 'Test Event',
  location: 'Test Location',
  website: 'https://example.com',
  startDate: new Date().toISOString(),
  seriesBrief: {
    id: 'series-1',
    organizationBrief: {
      id: 'org-1',
    },
  },
};

describe('EditEvent component', () => {
  it('should call updateEventAction with the correct data on form submission', async () => {
    const updateEventAction = jest.fn(() => Promise.resolve({ ok: true }));

    render(
      <EditEvent event={mockEvent} updateEventAction={updateEventAction} />,
    );

    // Change the name in the form
    const nameInput = screen.getByDisplayValue('Test Event');
    fireEvent.change(nameInput, { target: { value: 'New Event Name' } });

    // Click the save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for the action to be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Assert that the action was called with the correct data
    expect(updateEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'organizations/org-1/series/series-1/events/event-1',
        event: expect.objectContaining({
          name: 'New Event Name',
        }),
      }),
    );
  });
});
