import { render, screen } from '@/test-utils';

import { Preem } from './Preem';

jest.mock('@/components/AnimatedNumber', () => ({
  __esModule: true,
  AnimatedNumber: jest.fn(({ value }: { value: number }) => (
    <span>{value}</span>
  )),
}));

const mockPreemData = {
  organizationId: 'org-1',
  raceId: 'race-1',
  preem: {
    id: 'preem-1',
    path: 'preems/preem-1',
    name: 'Test Preem',
    description: 'This is a test preem.',
    raceBrief: {
      id: 'race-1',
      path: 'races/race-1',
      name: 'Test Race',
      eventBrief: {
        id: 'event-1',
        path: 'events/event-1',
        seriesBrief: {
          id: 'series-1',
          path: 'series/series-1',
          name: 'Test Series',
          organizationBrief: {
            id: 'org-1',
            path: 'organizations/org-1',
            name: 'Test Organization',
          },
        },
      },
    },
    status: 'Open',
    type: 'Pooled' as const,
    prizePool: 150,
    minimumThreshold: 100,
    timeLimit: new Date(),
  },
  children: [
    {
      contribution: {
        id: 'contrib-1',
        path: 'contributions/contrib-1',
        organizationId: 'org-1',
        preemId: 'preem-1',
        amount: 100,
        date: new Date(),
        message: 'Go get it!',
      },
      contributor: {
        id: 'user-1',
        path: 'users/user-1',
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      },
    },
    {
      contribution: {
        id: 'contrib-2',
        path: 'contributions/contrib-2',
        organizationId: 'org-1',
        preemId: 'preem-1',
        amount: 50,
        date: new Date(),
        message: 'Good luck!',
      },
      contributor: {
        id: 'user-2',
        path: 'users/user-2',
        name: 'Jane Doe',
      },
    },
  ],
};

describe('Preem component', () => {
  it('renders preem details and contributions correctly', () => {
    render(<Preem {...mockPreemData} />);

    expect(screen.getByText('Test Preem')).toBeInTheDocument();
    expect(screen.getByText('This is a test preem.')).toBeInTheDocument();
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
