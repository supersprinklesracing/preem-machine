import { render, screen } from '@/test-utils';

import { RaceCard } from './RaceCard';

const mockData = {
  race: {
    id: 'race-1',
    path: 'races/race-1',
    name: 'Test Race',
    organizationId: 'org-1',
    eventId: 'event-1',
    timezone: 'America/Los_Angeles',
    startDate: new Date(),
    description: 'This is a test race.',
    website: 'https://example.com',
    category: 'Category A',
    gender: 'Men',
    courseDetails: 'A beautiful course.',
    currentRacers: 10,
    maxRacers: 100,
    duration: '60 minutes',
    laps: 20,
    podiums: 3,
    sponsors: ['Sponsor 1', 'Sponsor 2'],
    eventBrief: {
      id: 'event-1',
      path: 'events/event-1',
      name: 'Test Event',
      startDate: new Date(),
      location: 'Test Location',
    },
  },
  preems: [
    {
      preem: {
        id: 'preem-1',
        path: 'preems/preem-1',
        name: 'Test Preem 1',
        organizationId: 'org-1',
        raceId: 'race-1',
        prizePool: 100,
      },
      children: [],
    },
    {
      preem: {
        id: 'preem-2',
        path: 'preems/preem-2',
        name: 'Test Preem 2',
        organizationId: 'org-1',
        raceId: 'race-1',
        prizePool: 50,
      },
      children: [],
    },
  ],
};

describe('RaceCard', () => {
  it('renders race details correctly', () => {
    render(<RaceCard race={mockData.race} preems={mockData.preems} />);

    expect(screen.getByText('Test Race')).toBeInTheDocument();
    expect(screen.getByText('This is a test race.')).toBeInTheDocument();
    expect(screen.getByText('Official Website')).toBeInTheDocument();
    expect(screen.getByText('Category A - Men')).toBeInTheDocument();
    expect(screen.getByText('A beautiful course.')).toBeInTheDocument();
    expect(screen.getByText('10 / 100')).toBeInTheDocument();
    expect(screen.getByText('60 minutes')).toBeInTheDocument();
    expect(screen.getByText('20 laps')).toBeInTheDocument();
    expect(
      screen.getByText('Sponsored by: Sponsor 1, Sponsor 2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});
