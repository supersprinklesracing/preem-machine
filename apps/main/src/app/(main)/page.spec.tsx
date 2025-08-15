import { render, screen } from '@/test-utils';
import Page from './page';
import { raceSeries } from '@/datastore/mock-data';

describe('Main Page', () => {
  it('should render the upcoming races title and race cards', async () => {
    const mockEventsWithRaces = raceSeries
      .flatMap((series) => series.events)
      .flatMap((event) => event.races.map((race) => ({ event, race })));

    const PageComponent = await Page();
    render(PageComponent);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Upcoming Races' })
    ).toBeInTheDocument();

    mockEventsWithRaces.forEach(({ race }) => {
      // Use getAllByText because the same event name can appear for multiple races
      expect(screen.getAllByText(race.name)[0]).toBeInTheDocument();
    });
  });
});
