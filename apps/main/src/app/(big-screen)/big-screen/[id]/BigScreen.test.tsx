import React from 'react';
import { render, screen } from '@/test-utils';
import BigScreen from './BigScreen';
import '../../../../matchMedia.mock';
import type { RaceWithPreems } from '@/datastore/firestore';
import type { ClientCompat, User } from '@/datastore/types';

const mockRace: RaceWithPreems = {
  id: 'race-1',
  name: 'Test Race',
  preems: [
    {
      id: 'preem-1',
      name: 'Test Preem 1',
      prizePool: 100,
      status: 'Open',
      contributions: [
        {
          id: 'contribution-1',
          amount: 50,
          contributor: { id: 'user-1', name: 'User One' },
          message: 'Go fast!',
        },
      ],
    },
    {
      id: 'preem-2',
      name: 'Test Preem 2',
      prizePool: 200,
      status: 'Awarded',
      contributions: [
        {
          id: 'contribution-2',
          amount: 100,
          contributor: { id: 'user-2', name: 'User Two' },
        },
        {
          id: 'contribution-3',
          amount: 100,
          contributor: { id: 'user-1', name: 'User One' },
        },
      ],
    },
  ],
};

const mockUsers: ClientCompat<User>[] = [
  {
    id: 'user-1',
    name: 'User One',
    avatarUrl: 'https://example.com/avatar1.png',
  },
  {
    id: 'user-2',
    name: 'User Two',
    avatarUrl: 'https://example.com/avatar2.png',
  },
];

describe('BigScreen component', () => {
  it('renders without crashing', () => {
    render(<BigScreen data={{ race: mockRace }} users={mockUsers} />);
    expect(screen.getByText('Live Contributions')).toBeInTheDocument();
  });
});
