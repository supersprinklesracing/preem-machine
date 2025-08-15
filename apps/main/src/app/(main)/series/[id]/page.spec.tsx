import { render, screen } from '@/test-utils';
import Page from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('Series Page', () => {
  it('should render the series name and events', async () => {
    const mockSeries = raceSeries[0];

    const PageComponent = await Page({ params: { id: mockSeries.id } });
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: mockSeries.name })
    ).toBeInTheDocument();
    mockSeries.events.forEach((e) => {
      expect(screen.getByText(e.name)).toBeInTheDocument();
    });
  });
});
