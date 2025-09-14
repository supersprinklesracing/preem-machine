import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import LivePreem from './LivePreem';
import LivePreemPage from './page';

// Mock dependencies
jest.mock('./LivePreem', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LivePreem</div>),
}));


setupMockDb();

describe('LivePreemPage component', () => {
  it.skip('should fetch preem data and render the LivePreem component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-1',
    });
    const PageComponent = await LivePreemPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LivePreem')).toBeInTheDocument();

    const livePreemCalls = (LivePreem as jest.Mock).mock.calls;
    expect(livePreemCalls[0][0].preem.id).toBe('preem-1');
  });

  it.skip('should throw NotFoundError when the preem does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/non-existent-preem',
    });
    expect(LivePreemPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
