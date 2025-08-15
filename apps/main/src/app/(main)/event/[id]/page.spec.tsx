import { render, screen } from '@/test-utils';
import Page from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('Event Page', () => {
  it('should render the event name and races', async () => {
    const mockEvent = raceSeries[0].events[0];

    const PageComponent = await Page({ params: { id: mockEvent.id } });
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: mockEvent.name })
    ).toBeInTheDocument();
    mockEvent.races.forEach((r) => {
      expect(screen.getByText(r.name)).toBeInTheDocument();
    });
  });
});
