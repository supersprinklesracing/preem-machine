import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import Event from './Event';
import EventPage from './page';

// Mock dependencies
jest.mock('./Event', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Event</div>),
}));

setupMockDb();

describe('EventPage component', () => {
  it('should fetch event data and render the Event component', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    };
    const PageComponent = await EventPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock Event')).toBeInTheDocument();

    const eventCalls = (Event as jest.Mock).mock.calls;
    expect(eventCalls[0][0].event.id).toBe('event-giro-sf-2025');
  });

  it('should throw NotFoundError when the event does not exist', async () => {
    const searchParams = { path: 'events/non-existent-event' };
    expect(EventPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
