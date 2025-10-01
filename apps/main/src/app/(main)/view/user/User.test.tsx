import { MOCK_AUTH_USER, MOCK_USER, render, screen } from '@/test-utils';

import { User } from './User';

const mockUserData = {
  user: MOCK_USER,
  contributions: [
    {
      id: 'contrib-1',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
      amount: 100,
      date: new Date(),
      preemBrief: {
        id: 'test-preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem 1',
        raceBrief: {
          id: 'test-race-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          name: 'Test Race 1',
        },
      },
    },
    {
      id: 'contrib-2',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-2/preems/preem-2/contributions/contrib-2',
      amount: 50,
      date: new Date(),
      preemBrief: {
        id: 'test-preem-2',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-2/preems/preem-2',
        name: 'Test Preem 2',
        raceBrief: {
          id: 'test-race-2',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-2',
          name: 'Test Race 2',
        },
      },
    },
  ],
};

describe('User component', () => {
  it('renders user details and contributions correctly', () => {
    render(<User {...mockUserData} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test-user@example.com')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();

    expect(screen.getByText('Test Race 1')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();

    expect(screen.getByText('Test Race 2')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 2')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('shows "Go to My Account" button for own profile', () => {
    render(<User {...mockUserData} />, {
      userContext: {
        user: MOCK_USER,
        authUser: MOCK_AUTH_USER,
      },
    });
    expect(screen.getByText('Go to My Account')).toBeInTheDocument();
  });

  it('shows "Edit Profile" button for other users profile', () => {
    render(<User {...mockUserData} />, {
      userContext: {
        user: MOCK_USER,
        authUser: { ...MOCK_AUTH_USER, uid: 'user-2' },
      },
    });
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
});
