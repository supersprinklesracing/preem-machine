import React from 'react';

import { render, screen } from '@/test-utils';

import { LiveContributionFeed } from './LiveContributionFeed';

const mockData = {
  contributions: [
    {
      id: 'contrib-1',
      path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
      amount: 100,
      contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
      preemBrief: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem',
        raceBrief: {
          id: 'race-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          name: 'Test Race',
        },
      },
      message: 'Go fast!',
    },
  ],
};

describe('LiveContributionFeed component', () => {
  it('should render the contribution feed', () => {
    render(<LiveContributionFeed {...mockData} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText(/"Test Preem"/)).toBeInTheDocument();
    expect(screen.getByText(/"Test Race"/)).toBeInTheDocument();
    expect(screen.getByText(/"Go fast!"/)).toBeInTheDocument();
  });

  it('should render a message when there are no contributions', () => {
    render(<LiveContributionFeed {...{ contributions: [] }} />);

    expect(
      screen.getByText('Waiting for contributions...'),
    ).toBeInTheDocument();
  });
});
