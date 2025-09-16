import { render, screen } from '@/test-utils';
import User from './User';

const mockUserData = {
  user: {
    id: 'user-1',
    path: 'users/user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    affiliation: 'Test Team',
    raceLicenseId: '12345',
    address: '123 Main St',
  },
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

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Affiliation: Test Team')).toBeInTheDocument();
    expect(screen.getByText('Race License ID: 12345')).toBeInTheDocument();
    expect(screen.getByText('Address: 123 Main St')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();

    expect(screen.getByText('Test Race 1')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();

    expect(screen.getByText('Test Race 2')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 2')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('shows "Go to My Account" button for own profile', () => {
    const authUser = {
      uid: 'user-1',
      email: 'john.doe@example.com',
      emailVerified: true,
      token: 'idToken1',
      customClaims: {},
      displayName: null,
      phoneNumber: null,
      photoURL: null,
      providerId: '',
    };
    render(<User {...mockUserData} />, {
      userContext: { authUser, user: null },
    });
    expect(screen.getByText('Go to My Account')).toBeInTheDocument();
  });

  it('shows "Edit Profile" button for other users profile', () => {
    const authUser = {
      uid: 'user-2',
      email: 'jane.doe@example.com',
      emailVerified: true,
      token: 'idToken2',
      customClaims: {},
      displayName: null,
      phoneNumber: null,
      photoURL: null,
      providerId: '',
    };
    render(<User {...mockUserData} />, {
      userContext: { authUser, user: null },
    });
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
});
