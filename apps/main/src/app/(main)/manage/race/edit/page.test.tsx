import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import { EditRace } from './EditRace';
import EditRacePage from './page';

// Mock dependencies
jest.mock('./EditRace', () => ({
  __esModule: true,
  EditRace: jest.fn(() => <div>Mock EditRace</div>),
}));
jest.mock('./edit-race-action', () => ({
  editRaceAction: jest.fn(),
}));

setupMockDb();

describe('EditRacePage component', () => {
  it('should fetch race data and render the EditRace component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    });
    const PageComponent = await EditRacePage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock EditRace')).toBeInTheDocument();

    const editRaceCalls = (EditRace as jest.Mock).mock.calls;
    expect(editRaceCalls[0][0].race.id).toBe('race-giro-sf-2025-masters-women');
  });

  it('should throw NotFoundError when the race does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/non-existent-race',
    });
    expect(EditRacePage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
