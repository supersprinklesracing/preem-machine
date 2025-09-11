import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import Event from './Event';

const mockData = {
  event: {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Event',
    description: 'This is a test event.',
    website: 'https://example.com',
    location: 'Test Location',
    startDate: new Date(),
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
  },
  children: [
    {
      race: {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Race 1',
        category: 'Pro',
        startDate: new Date(),
        eventBrief: {
          id: 'event-1',
          path: 'organizations/org-1/series/series-1/events/event-1',
          name: 'Test Event',
        },
      },
      children: [],
    },
    {
      race: {
        id: 'race-2',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-2',
        name: 'Test Race 2',
        category: 'Amateur',
        startDate: new Date(),
        eventBrief: {
          id: 'event-1',
          path: 'organizations/org-1/series/series-1/events/event-1',
          name: 'Test Event',
        },
      },
      children: [],
    },
  ],
};

describe('Event component', () => {
  it('should render event details', () => {
    render(<Event {...mockData} />);

    // Check for event details
    expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument();
    expect(screen.getByText('This is a test event.')).toBeInTheDocument();
    expect(screen.getByText('Official Website')).toBeInTheDocument();
    expect(screen.getByText('Test Series')).toBeInTheDocument();
  });
});
