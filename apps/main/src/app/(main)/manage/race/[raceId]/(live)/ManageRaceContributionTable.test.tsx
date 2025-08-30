import { render, screen } from '@/test-utils';
import React from 'react';
import ManageRaceContributionTable from './ManageRaceContributionTable';
import type { RaceWithPreems } from '@/datastore/firestore';
import '../../../../../../matchMedia.mock';

// Mock child components
jest.mock('./UserAvatar', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock UserAvatar</div>),
}));

const mockRace: RaceWithPreems = {
  id: 'race-1',
  name: 'Test Race',
  preems: [
    {
      id: 'preem-1',
      name: 'Test Preem 1',
      contributions: [
        {
          id: 'contrib-1',
          amount: 100,
          message: 'Go fast!',
          contributor: { id: 'user-1', name: 'Alice' },
          preemBrief: { id: 'preem-1', name: 'Test Preem 1' },
        },
      ],
    },
  ],
};

describe('ManageRaceContributionTable component', () => {
  it('should render the contribution table', () => {
    render(<ManageRaceContributionTable race={mockRace} users={[]} />);

    expect(screen.getByText('Mock UserAvatar')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
    expect(screen.getByText('Go fast!')).toBeInTheDocument();
  });

  it('should render a message when there are no contributions', () => {
    const raceWithNoContributions: RaceWithPreems = {
      ...mockRace,
      preems: [{ id: 'preem-1', name: 'Test Preem 1', contributions: [] }],
    };
    render(
      <ManageRaceContributionTable race={raceWithNoContributions} users={[]} />,
    );

    expect(
      screen.getByText('Waiting for contributions...'),
    ).toBeInTheDocument();
  });
});
