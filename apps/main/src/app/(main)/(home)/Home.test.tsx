import { render, screen, within } from '@/test-utils';

import { Home } from './Home';

const mockData = {
  eventsWithRaces: [
    {
      event: {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event 1',
        startDate: new Date(),
        location: 'Test Location 1',
      },
      children: [
        {
          race: {
            id: 'race-1',
            path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
            name: 'Test Race 1',
            startDate: new Date(),
            category: 'Pro',
          },
          children: [],
        },
      ],
    },
  ],
  contributions: [
    {
      id: 'contrib-1',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
      amount: 100,
      contributor: {
        id: 'user-1',
        path: 'users/user-1',
        name: 'Test Contributor',
      },
      preemBrief: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem',
        raceBrief: {
          id: 'race-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          name: 'Test Race 1',
        },
      },
    },
  ],
};

describe('Home component', () => {
  it('should render upcoming events and contributions', () => {
    render(<Home {...mockData} />);

    // Check for event details
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    const eventCard = screen
      .getByText('Test Event 1')
      .closest('div[class*="mantine-Card-root"]');
    const raceLink = within(eventCard).getByRole('link', {
      name: /Test Race 1/,
    });
    expect(raceLink).toBeInTheDocument();
    expect(raceLink).toHaveAttribute('href', '/org-1/series-1/event-1/race-1');

    // Check for the title of the LiveContributionFeed component
    expect(screen.getByText('Live Contribution Feed')).toBeInTheDocument();
  });
});
