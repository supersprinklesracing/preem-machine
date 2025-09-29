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
        path: 'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewRace')).toBeInTheDocument();
  });
});
