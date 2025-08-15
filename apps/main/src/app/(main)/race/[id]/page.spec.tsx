import { render, screen } from '@/test-utils';
import RacePage from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('RacePage', () => {
  it('renders the race name', async () => {
    const mockRace = raceSeries[0].events[0].races[0];
    const Page = await RacePage({ params: { id: mockRace.id } });
    render(Page);

    expect(
      screen.getByRole('heading', { name: mockRace.name })
    ).toBeInTheDocument();
  });
});
