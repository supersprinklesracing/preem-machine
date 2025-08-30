import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import { Race } from './Race';
import type { RacePageData } from './Race';
import '../../../../matchMedia.mock';

// Mock child components
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock RaceCard</div>),
}));
jest.mock('@/components/animated-number', () => ({
  __esModule: true,
  default: jest.fn(({ value }) => <span>{value}</span>),
}));
jest.mock('@/components/PreemStatusBadge', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock PreemStatusBadge</div>),
}));
jest.mock('@/components/contribution-modal', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock ContributionModal</div>),
}));

const mockData: RacePageData = {
  race: {
    id: 'race-1',
    name: 'Test Race',
    preems: [
      {
        id: 'preem-1',
        name: 'Test Preem 1',
        prizePool: 100,
        contributions: [],
      },
    ],
  },
};

describe('Race component', () => {
  it('should render race and preem details', () => {
    render(<Race data={mockData} />);

    expect(screen.getByText('Mock RaceCard')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
  });

  it('should open the contribution modal when "Contribute" is clicked', () => {
    render(<Race data={mockData} />);

    const contributeButton = screen.getByText('Contribute');
    fireEvent.click(contributeButton);

    expect(screen.getByText('Mock ContributionModal')).toBeInTheDocument();
  });
});
