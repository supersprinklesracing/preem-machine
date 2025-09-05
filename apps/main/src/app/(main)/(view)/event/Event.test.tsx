import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import type { EventPageData } from './Event';
import Event from './Event';

const mockData: EventPageData = {
  event: {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event',
    location: 'Test Location',
    startDate: new Date().toISOString(),
    seriesBrief: {
      id: 'series-1',
      path: 'organizations/org-1/series/series-1',
      name: 'Test Series',
      organizationBrief: {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Org',
      },
    },
    races: [
      {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race 1',
        category: 'Pro',
        startDate: new Date().toISOString(),
      },
      {
        id: 'race-2',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-2',
        name: 'Test Race 2',
        category: 'Amateur',
        startDate: new Date().toISOString(),
      },
    ],
  },
};

describe('Event component', () => {
  it('should render event details', () => {
    render(<Event {...mockData} />);

    // Check for event details
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Series')).toBeInTheDocument();
  });
});
