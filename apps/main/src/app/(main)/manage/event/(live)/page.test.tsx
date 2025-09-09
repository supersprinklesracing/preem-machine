import { NotFoundError } from '@/datastore/errors';
import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import LiveEvent from './LiveEvent';
import LiveEventPage from './page';

// Mock dependencies
jest.mock('./LiveEvent', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LiveEvent</div>),
}));
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
  }),
  useSearchParams: () => ({
    get: () => {},
  }),
}));

setupMockDb();

describe('LiveEventPage component', () => {
  it('should fetch event data and render the LiveEvent component', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    };
    const PageComponent = await LiveEventPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LiveEvent')).toBeInTheDocument();

    const liveEventCalls = (LiveEvent as jest.Mock).mock.calls;
    expect(liveEventCalls[0][0].event.id).toBe('event-giro-sf-2025');
  });

  it('should throw NotFoundError when the event does not exist', async () => {
    const searchParams = {
      path: 'organizations/org-1/series/series-1/events/non-existent-event',
    };
    expect(LiveEventPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
