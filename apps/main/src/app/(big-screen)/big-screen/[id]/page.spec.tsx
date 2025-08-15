import { render, screen } from '@/test-utils';
import BigScreenPage from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('BigScreenPage', () => {
  it('renders the race name', async () => {
    const mockPreem = raceSeries[0].events[0].races[0].preems[0];
    const Page = await BigScreenPage({
      params: { id: raceSeries[0].events[0].races[0].id },
    });
    render(Page);

    expect(
      screen.getByRole('heading', { name: 'Mid-Race Sprint' })
    ).toBeInTheDocument();
  });
});
