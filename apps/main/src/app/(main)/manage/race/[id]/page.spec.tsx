import { render, screen } from '@/test-utils';
import ManageRacePage from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('ManageRacePage', () => {
  it('renders the race name', async () => {
    const mockRace = raceSeries[0].events[0].races[0];
    const Page = await ManageRacePage({ params: { id: mockRace.id } });
    render(Page);

    expect(
      screen.getByRole('heading', { name: mockRace.name })
    ).toBeInTheDocument();
  });
});
