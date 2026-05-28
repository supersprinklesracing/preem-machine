import { ContributionWithUser } from '@/datastore/query-schema';
import { render, screen } from '@/test-utils';

import { ManagePreemContributionTable } from './ManagePreemContributionTable';

// Mock child components
jest.mock('@/components/UserAvatar/UserAvatar', () => ({
  UserAvatar: jest.fn(() => <div>Mock UserAvatar</div>),
}));

const mockContributions: ContributionWithUser[] = [
  {
    contribution: {
      id: 'contrib-1',
      path: 'contributions/contrib-1',
      amount: 100,
      message: 'Go fast!',
      preemBrief: {
        id: 'preem-1',
        path: 'preems/preem-1',
        name: 'Test Preem 1',
      },
      organizationId: 'org-1',
      preemId: 'preem-1',
      date: new Date(),
    },
    contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
  },
];

describe('ManagePreemContributionTable component', () => {
  it('should render the contribution table', () => {
    render(
      <ManagePreemContributionTable>
        {mockContributions}
      </ManagePreemContributionTable>,
    );

    expect(screen.getByText('Mock UserAvatar')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getAllByText('Preem').length).toBeGreaterThan(0);
    expect(screen.getByText('Go fast!')).toBeInTheDocument();
  });

  it('should render a message when there are no contributions', () => {
    render(<ManagePreemContributionTable>{[]}</ManagePreemContributionTable>);

    expect(
      screen.getByText('Waiting for contributions...'),
    ).toBeInTheDocument();
  });
});
