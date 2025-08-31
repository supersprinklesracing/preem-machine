import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { EditEvent } from './EditEvent';
import { NotFoundError } from '@/datastore/errors';
import EditEventPage from './page';
import { updateEventAction } from './update-event-action';

// Mock dependencies
jest.mock('./EditEvent', () => ({
  __esModule: true,
  EditEvent: jest.fn(() => <div>Mock EditEvent</div>),
}));
jest.mock('./update-event-action', () => ({
  updateEventAction: jest.fn(),
}));

setupMockDb();

describe('EditEventPage component', () => {
  it('should fetch event data and render the EditEvent component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    });
    const PageComponent = await EditEventPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock EditEvent')).toBeInTheDocument();

    const editEventCalls = (EditEvent as jest.Mock).mock.calls;
    expect(editEventCalls[0][0].event.id).toBe('event-giro-sf-2025');
    expect(editEventCalls[0][0].updateEventAction).toBe(updateEventAction);
  });

  it('should throw NotFoundError when the event does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/non-existent-event',
    });
    expect(EditEventPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
