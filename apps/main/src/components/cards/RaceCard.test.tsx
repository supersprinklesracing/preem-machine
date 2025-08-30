import { render, screen } from '@/test-utils';
import RaceCard from './RaceCard';
import { RaceWithPreems } from '@/datastore/firestore';
import { ClientCompat } from '@/datastore/types';

const mockRace: ClientCompat<RaceWithPreems> = {
  id: 'race-1',
  name: 'Test Race',
  category: 'Category A',
  gender: 'Men',
  courseDetails: 'A beautiful course.',
  currentRacers: 10,
  maxRacers: 100,
  duration: '60 minutes',
  laps: 20,
  eventBrief: {
    id: 'event-1',
    name: 'Test Event',
    startDate: new Date().toISOString(),
    location: 'Test Location',
  },
  preems: [
    {
      id: 'preem-1',
      prizePool: 100,
      contributions: [],
    },
    {
      id: 'preem-2',
      prizePool: 50,
      contributions: [],
    },
  ],
};

describe('RaceCard', () => {
  it('renders race details correctly', () => {
    render(<RaceCard race={mockRace} />);

    expect(screen.getByText('Test Race')).toBeInTheDocument();
    expect(screen.getByText('Category A - Men')).toBeInTheDocument();
    expect(screen.getByText('A beautiful course.')).toBeInTheDocument();
    expect(screen.getByText('10 / 100')).toBeInTheDocument();
    expect(screen.getByText('60 minutes')).toBeInTheDocument();
    expect(screen.getByText('20 laps')).toBeInTheDocument();
  });
});
