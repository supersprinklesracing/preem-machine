import type { RaceWithPreems } from '@/datastore/query-schema';

import { render, screen } from '@/test-utils';
import ManageRaceContributionTable from './ManageRaceContributionTable';

// Mock child components
jest.mock('./UserAvatar', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock UserAvatar</div>),
}));

const mockRace: RaceWithPreems = {
  race: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
  },
  children: [
    {
      preem: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem 1',
      },
      children: [
        {
          id: 'contrib-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
          amount: 100,
          message: 'Go fast!',
          contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
          preemBrief: {
            id: 'preem-1',
            path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
            name: 'Test Preem 1',
          },
        },
      ],
    },
  ],
};

describe('ManageRaceContributionTable component', () => {
  it('should render the contribution table', () => {
    render(<ManageRaceContributionTable {...mockRace} />);

    expect(screen.getByText('Mock UserAvatar')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
    expect(screen.getByText('Go fast!')).toBeInTheDocument();
  });

  it('should render a message when there are no contributions', () => {
    const raceWithNoContributions: RaceWithPreems = {
      ...mockRace,
      children: [{ id: 'preem-1', name: 'Test Preem 1', children: [] }],
    };
    render(
      <ManageRaceContributionTable race={raceWithNoContributions} users={[]} />,
    );

    expect(
      screen.getByText('Waiting for contributions...'),
    ).toBeInTheDocument();
  });
});
