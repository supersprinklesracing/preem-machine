import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import { Race } from './Race';

import { DateLocationDetail } from '@/components/cards/DateLocationDetail';

// Mock child components
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  default: jest.fn(({ race }) => (
    <div>
      Mock RaceCard
      <DateLocationDetail {...race} />
    </div>
  )),
}));
jest.mock('@/components/AnimatedNumber', () => ({
  __esModule: true,
  default: jest.fn(({ value }) => <span>{value}</span>),
}));
jest.mock('@/components/PreemStatusBadge/PreemStatusBadge', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock PreemStatusBadge</div>),
}));
jest.mock('@/components/ContributionModal', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock ContributionModal</div>),
}));

const mockData = {
  race: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
    timezone: 'America/Los_Angeles',
    startDate: new Date(),
  },
  children: [
    {
      preem: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem 1',
        prizePool: 100,
      },
      children: [],
    },
  ],
};

describe('Race component', () => {
  it('should render race and preem details', () => {
    render(<Race {...mockData} />);

    expect(screen.getByText('Mock RaceCard')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
  });

  it('should open the contribution modal when "Contribute" is clicked', () => {
    render(<Race {...mockData} />);

    const contributeButton = screen.getByText('Contribute');
    fireEvent.click(contributeButton);

    expect(screen.getByText('Mock ContributionModal')).toBeInTheDocument();
  });

  it('should display the timezone', () => {
    render(<Race {...mockData} />);
    expect(screen.getByText(/PDT/)).toBeInTheDocument();
  });
});
