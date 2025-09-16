import { render, screen } from '@/test-utils';
import PreemCard from './PreemCard';
import { Preem } from '@/datastore/schema';

const mockPreem: Preem = {
  id: 'preem-1',
  path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
  name: 'Test Preem',
  description: 'This is a test preem.',
  prizePool: 150,
  raceBrief: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
  },
};

describe('PreemCard', () => {
  it('renders preem details correctly', () => {
    render(<PreemCard preem={mockPreem} />);

    expect(screen.getByText('Test Preem')).toBeInTheDocument();
    expect(screen.getByText('This is a test preem.')).toBeInTheDocument();
    expect(screen.getByText('Prize Pool $150')).toBeInTheDocument();
    expect(screen.getByText('Test Race')).toBeInTheDocument();
  });
});
