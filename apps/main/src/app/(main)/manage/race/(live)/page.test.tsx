import { NotFoundError } from '@/datastore/errors';
import { render, screen, setupMockDb } from '@/test-utils';

import { LiveRace } from './LiveRace';
import LiveRacePage from './page';

// Mock dependencies
jest.mock('./LiveRace', () => ({
  __esModule: true,
  LiveRace: jest.fn(() => <div>Mock LiveRace</div>),
}));

setupMockDb();

describe('LiveRacePage component', () => {
  it('should fetch race data and render the LiveRace component', async () => {
    const searchParams = Promise.resolve({
      path: 'races/masters-women',
    });
    const PageComponent = await LiveRacePage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LiveRace')).toBeInTheDocument();

    const liveRaceCalls = (LiveRace as jest.Mock).mock.calls;
    expect(liveRaceCalls[0][0].race.id).toBe('masters-women');
  });

  it('should throw NotFoundError when the race does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'races/non-existent-race',
    });
    await expect(LiveRacePage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
