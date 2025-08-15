import { render, screen } from '@/test-utils';
import Page from './page';
import { raceSeries } from '@/datastore/mock-data';
import * as dataAccess from '@/datastore/data-access';

// Mock data access
jest.mock('@/datastore/data-access');
const mockedDataAccess = jest.mocked(dataAccess);

describe('Main Page', () => {
  it('should render the upcoming races title and race cards', async () => {
    const mockEventsWithRaces = raceSeries
      .flatMap((series) => series.events)
      .flatMap((event) => event.races.map((race) => ({ event, race })));

    mockedDataAccess.getEventsWithRaces.mockResolvedValue(mockEventsWithRaces);
    mockedDataAccess.getUsers.mockResolvedValue([]);

    const PageComponent = await Page();
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Upcoming Races' })
    ).toBeInTheDocument();

    mockEventsWithRaces.forEach(({ event }) => {
      // Use getAllByText because the same event name can appear for multiple races
      expect(screen.getAllByText(event.name)[0]).toBeInTheDocument();
    });
  });
});
