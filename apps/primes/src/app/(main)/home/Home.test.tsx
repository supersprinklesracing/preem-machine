import { render, screen, within } from '@/test-utils';

import { Home } from './Home';

const mockData = {
  preems: [
    {
      id: 'preem-1',
      path: 'preems/preem-1',
      name: 'Test Preem',
      status: 'Open',
      organizationId: 'org-1',
      raceId: 'race-1',
      raceBrief: {
        id: 'race-1',
        path: 'races/race-1',
        name: 'Test Race 1',
        startDate: new Date(),
        eventBrief: {
          id: 'event-1',
          path: 'events/event-1',
          name: 'Test Event 1',
        },
      },
    },
  ],
  eventsWithRaces: [
    {
      event: {
        id: 'event-1',
        path: 'events/event-1',
        name: 'Test Event 1',
        startDate: new Date(),
        location: 'Test Location 1',
        organizationId: 'org-1',
        seriesId: 'series-1',
      },
      children: [
        {
          race: {
            id: 'race-1',
            path: 'races/race-1',
            name: 'Test Race 1',
            startDate: new Date(),
            category: 'Pro',
            organizationId: 'org-1',
            seriesId: 'series-1',
            eventId: 'event-1',
          },
          children: [],
        },
      ],
    },
  ],
  contributions: [
    {
      contribution: {
        id: 'contrib-1',
        path: 'contributions/contrib-1',
        amount: 100,
        organizationId: 'org-1',
        preemId: 'preem-1',
        preemBrief: {
          id: 'preem-1',
          path: 'preems/preem-1',
          name: 'Test Preem',
          raceBrief: {
            id: 'race-1',
            path: 'races/race-1',
            name: 'Test Race 1',
          },
        },
      },
      contributor: {
        id: 'user-1',
        path: 'users/user-1',
        name: 'Test Contributor',
      },
    },
  ],
};

describe('Home component', () => {
  it('should render upcoming events and contributions', () => {
    render(<Home {...mockData} />);

    // Check for event details
    const eventCard = screen
      .getByText('Test Location 1')
      .closest('div[class*="mantine-Card-root"]');
    const raceLink = within(eventCard as HTMLElement).getByRole('link', {
      name: /Test Race 1/,
    });
    expect(raceLink).toBeInTheDocument();
    expect(raceLink).toHaveAttribute('href', '/view/race?path=races/race-1');

    // Check for the title of the LiveContributionFeed component
    expect(screen.getByText('Live Contribution Feed')).toBeInTheDocument();
  });
});
