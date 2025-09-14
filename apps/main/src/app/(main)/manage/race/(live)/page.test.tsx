import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import LiveRace from './LiveRace';
import LiveRacePage from './page';

// Mock dependencies
jest.mock('./LiveRace', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock LiveRace</div>),
}));


setupMockDb();

describe('LiveRacePage component', () => {
  it('should fetch race data and render the LiveRace component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    });
    const PageComponent = await LiveRacePage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LiveRace')).toBeInTheDocument();

    const liveRaceCalls = (LiveRace as jest.Mock).mock.calls;
    expect(liveRaceCalls[0][0].race.id).toBe('race-giro-sf-2025-masters-women');
  });

  it('should throw NotFoundError when the race does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-1/series/series-1/events/event-1/races/non-existent-race',
    });
    expect(LiveRacePage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
