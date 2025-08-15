import { render, screen } from '@/test-utils';
import PreemPage from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('PreemPage', () => {
  it('renders the preem name', async () => {
    const mockPreem = raceSeries[0].events[0].races[0].preems[0];
    const Page = await PreemPage({ params: { id: mockPreem.id } });
    render(Page);

    expect(
      screen.getByRole('heading', { name: mockPreem.name })
    ).toBeInTheDocument();
  });
});
