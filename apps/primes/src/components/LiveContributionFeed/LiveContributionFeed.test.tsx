import React from 'react';

import { render, screen } from '@/test-utils';

import { LiveContributionFeed } from './LiveContributionFeed';

const mockData = {
  contributions: [
    {
      contribution: {
        id: 'contrib-1',
        path: 'contributions/contrib-1',
        amount: 100,
        message: 'Go fast!',
        preemId: 'preem-1',
        organizationId: 'org-1',
        date: new Date(1752390000 * 1000),
      },
      contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
    },
  ],
};

describe('LiveContributionFeed component', () => {
  it('should render the contribution feed', () => {
    render(<LiveContributionFeed {...mockData} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText(/"Go fast!"/)).toBeInTheDocument();
  });

  it('should render a message when there are no contributions', () => {
    render(<LiveContributionFeed contributions={[]} />);

    expect(
      screen.getByText('Waiting for contributions...'),
    ).toBeInTheDocument();
  });

  it('should have accessibility attributes for live updates', () => {
    render(<LiveContributionFeed {...mockData} />);
    const region = screen.getByRole('log');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
