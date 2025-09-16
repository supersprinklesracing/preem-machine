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
  it('should fetch preem data and render the LivePreem component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
    });
    const PageComponent = await LivePreemPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LivePreem')).toBeInTheDocument();

    const livePreemCalls = (LivePreem as jest.Mock).mock.calls;
    expect(livePreemCalls[0][0].preem.id).toBe('preem-giro-sf-2025-masters-women-first-lap');
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/does-not-exist',
    });
    expect(LivePreemPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
