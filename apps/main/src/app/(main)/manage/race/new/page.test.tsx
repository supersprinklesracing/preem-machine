import { render, screen } from '@/test-utils';
import NewRacePage from './page';
import '@/matchMedia.mock';

jest.mock('./NewRace', () => ({
  __esModule: true,
  NewRace: jest.fn(() => <div>Mock NewRace</div>),
}));

jest.mock('./new-race-action', () => ({
  __esModule: true,
  createRaceAction: jest.fn(),
}));

describe('NewRacePage', () => {
  it('should render the NewRace component', async () => {
    const PageComponent = await NewRacePage({
      searchParams: {
        path: 'organizations/org-1/series/series-1/events/event-1/races',
      },
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewRace')).toBeInTheDocument();
  });
});
