import { render, screen } from '@/test-utils';
import Page from './page';
import { raceSeries } from '@/datastore/mock-data';

// Mock data access
jest.mock('@/datastore/data-access', () => ({
  getUsers: jest.fn().mockResolvedValue([]),
}));

describe('Main Page', () => {
  it('should render the upcoming races title and race cards', async () => {
    const PageComponent = await Page();
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Upcoming Races' })
    ).toBeInTheDocument();

    const allRaces = raceSeries.flatMap((series) => series.races);
    const raceCards = screen.getAllByText(/Contribute/i);
    expect(raceCards.length).toBe(allRaces.length);
  });
});
