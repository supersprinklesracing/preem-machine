import { render, screen } from '@/test-utils';
import Preem from './Preem';

jest.mock(
  '@/components/animated-number',
  () =>
    ({ value }: { value: number }) => <span>{value}</span>,
);

const mockPreemData = {
  preem: {
    id: 'preem-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
    name: 'Test Preem',
    raceBrief: {
      id: 'race-1',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
      name: 'Test Race',
      eventBrief: {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        seriesBrief: {
          id: 'series-1',
          path: 'organizations/org-1/series/series-1',
          organizationBrief: {
            id: 'org-1',
            path: 'organizations/org-1',
          },
        },
      },
    },
    status: 'Open',
    type: 'Pooled',
    prizePool: 150,
    minimumThreshold: 100,
    timeLimit: new Date().toISOString(),
  },
  children: [
    {
      id: 'contrib-1',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
      contributor: {
        id: 'user-1',
        path: 'users/user-1',
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      },
      amount: 100,
      date: new Date().toISOString(),
      message: 'Go get it!',
    },
    {
      id: 'contrib-2',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-2',
      contributor: {
        id: 'user-2',
        path: 'users/user-2',
        name: 'Jane Doe',
      },
      amount: 50,
      date: new Date().toISOString(),
      message: 'Good luck!',
    },
  ],
};

describe('Preem component', () => {
  it('renders preem details and contributions correctly', () => {
    render(<Preem {...mockPreemData} />);

    expect(screen.getByText('Test Preem')).toBeInTheDocument();
    expect(screen.getByText('Part of Test Race')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Pooled')).toBeInTheDocument();
    expect(screen.getByText('Threshold: $100')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Go get it!')).toBeInTheDocument();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Good luck!')).toBeInTheDocument();
  });
});
