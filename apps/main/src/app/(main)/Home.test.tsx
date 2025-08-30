import { render, screen } from '@/test-utils';
import React from 'react';
import Home from './Home';
import type { HomePageData } from './Home';
import '../../matchMedia.mock';

const mockData: HomePageData = {
  upcomingEvents: [
    {
      id: 'event-1',
      name: 'Test Event 1',
      startDate: new Date().toISOString(),
      location: 'Test Location 1',
      races: [
        {
          id: 'race-1',
          name: 'Test Race 1',
          startDate: new Date().toISOString(),
          category: 'Pro',
        },
      ],
    },
  ],
  contributions: [
    {
      id: 'contrib-1',
      amount: 100,
      contributor: { name: 'Test Contributor' },
      preemBrief: { name: 'Test Preem' },
    },
  ],
};

describe('Home component', () => {
  it('should render upcoming events and contributions', () => {
    render(<Home data={mockData} />);

    // Check for event details
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    expect(screen.getByText(/Test Race 1/)).toBeInTheDocument();

    // Check for the title of the LiveContributionFeed component
    expect(screen.getByText('Live Contribution Feed')).toBeInTheDocument();
  });
});
