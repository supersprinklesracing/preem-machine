import {
  MOCK_ADMIN_AUTH_USER,
  MOCK_USER,
  render,
  screen,
  withAdminUserContext,
  withLoggedInUserContext,
} from '@/test-utils';

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
  organizations: [
    {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Org 1',
    },
    {
      id: 'org-2',
      path: 'organizations/org-2',
      name: 'Test Org 2',
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

  it('renders organizations correctly', () => {
    render(<User {...mockUserData} />, { ...withLoggedInUserContext() });

    expect(screen.getByText('Test Org 1')).toBeInTheDocument();
    expect(screen.getByText('Test Org 2')).toBeInTheDocument();

    const org1Link = screen.getByText('Test Org 1').closest('a');
    expect(org1Link).toHaveAttribute('href', '/view/org-1');

    const org2Link = screen.getByText('Test Org 2').closest('a');
    expect(org2Link).toHaveAttribute('href', '/view/org-2');
  });

  it('shows "Go to My Account" button for own profile', () => {
    render(<User {...mockUserData} />, {
      ...withLoggedInUserContext(),
    });
    expect(screen.getByText('Go to My Account')).toBeInTheDocument();
  });

  it('hides "My Account" button for other users profile', () => {
    render(
      <User
        user={MOCK_ADMIN_AUTH_USER}
        contributions={[]}
        organizations={[]}
      />,
      {
        ...withAdminUserContext(),
      },
    );
    expect(screen.queryByText('Go to My Account')).not.toBeInTheDocument();
  });
});
