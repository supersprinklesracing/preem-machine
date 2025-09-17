import { render, screen } from '@/test-utils';
import RaceCard from './RaceCard';

const mockData = {
  race: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
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
      path: 'organizations/org-1/series/series-1/events/event-1',
      name: 'Test Event',
      startDate: new Date(),
      location: 'Test Location',
    },
  },
  preems: [
    {
      preem: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        prizePool: 100,
      },
      children: [],
    },
    {
      preem: {
        id: 'preem-2',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-2',
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
