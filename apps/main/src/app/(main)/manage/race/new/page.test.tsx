import { render, screen, setupMockDb } from '@/test-utils';
import NewRacePage from './page';

jest.mock('./NewRace', () => ({
  __esModule: true,
  NewRace: jest.fn(() => <div>Mock NewRace</div>),
}));

jest.mock('./new-race-action', () => ({
  __esModule: true,
  createRaceAction: jest.fn(),
}));

describe('NewRacePage', () => {
  setupMockDb();

  it('should render the NewRace component', async () => {
    const PageComponent = await NewRacePage({
      searchParams: Promise.resolve({
        path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewRace')).toBeInTheDocument();
  });
});
