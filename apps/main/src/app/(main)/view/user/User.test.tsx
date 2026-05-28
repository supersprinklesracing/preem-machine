import {
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
      contribution: {
        id: 'contrib-1',
        path: 'contributions/contrib-1',
        amount: 100,
        date: new Date(),
        preemId: 'test-preem-1',
        organizationId: 'org-1',
      },
      preem: {
        id: 'test-preem-1',
        path: 'preems/preem-1',
        name: 'Test Preem 1',
        raceId: 'test-race-1',
      },
      race: {
        id: 'test-race-1',
        path: 'races/race-1',
        name: 'Test Race 1',
      },
    },
    {
      contribution: {
        id: 'contrib-2',
        path: 'contributions/contrib-2',
        amount: 50,
        date: new Date(),
        preemId: 'test-preem-2',
        organizationId: 'org-1',
      },
      preem: {
        id: 'test-preem-2',
        path: 'preems/preem-2',
        name: 'Test Preem 2',
        raceId: 'test-race-2',
      },
      race: {
        id: 'test-race-2',
        path: 'races/race-2',
        name: 'Test Race 2',
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
    expect(org1Link).toHaveAttribute(
      'href',
      '/view/organization?path=organizations/org-1',
    );

    const org2Link = screen.getByText('Test Org 2').closest('a');
    expect(org2Link).toHaveAttribute(
      'href',
      '/view/organization?path=organizations/org-2',
    );
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
        user={{ ...MOCK_USER, id: 'other-user-id' }}
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
