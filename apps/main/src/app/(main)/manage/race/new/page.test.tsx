import { render, screen } from '@/test-utils';
import CreateRacePage from './page';
import '@/matchMedia.mock';

jest.mock('./CreateRace', () => ({
  __esModule: true,
  CreateRace: jest.fn(() => <div>Mock CreateRace</div>),
}));

jest.mock('./create-race-action', () => ({
  __esModule: true,
  createRaceAction: jest.fn(),
}));

describe('CreateRacePage', () => {
  it('should render the CreateRace component', async () => {
    const PageComponent = await CreateRacePage({
      searchParams: {
        path: 'organizations/org-1/series/series-1/events/event-1',
      },
    });
    render(PageComponent);
    expect(screen.getByText('Mock CreateRace')).toBeInTheDocument();
  });
});
