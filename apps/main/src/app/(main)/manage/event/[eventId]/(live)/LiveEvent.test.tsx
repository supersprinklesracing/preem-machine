import { render, screen } from '@/test-utils';
import React from 'react';
import LiveEvent from './LiveEvent';
import type { LiveEventPageData } from './LiveEvent';
import '../../../../../../matchMedia.mock';

// Mock the RaceCard component
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  default: jest.fn(({ race, children }) => (
    <div>
      <div>Mock RaceCard: {race.name}</div>
      {children}
    </div>
  )),
}));

const mockData: LiveEventPageData = {
  event: {
    id: 'event-1',
    name: 'Test Live Event',
    location: 'Test Location',
    startDate: new Date().toISOString(),
    seriesBrief: { id: 'series-1', name: 'Test Live Series' },
    races: [
      { id: 'race-1', name: 'Test Live Race 1' },
      { id: 'race-2', name: 'Test Live Race 2' },
    ],
  },
};

describe('LiveEvent component', () => {
  it('should render event details and race cards', () => {
    render(<LiveEvent data={mockData} />);

    // Check for event details
    expect(screen.getByText('Test Live Event')).toBeInTheDocument();
    expect(screen.getByText('Test Live Series')).toBeInTheDocument();

    // Check for mocked race cards
    expect(
      screen.getByText('Mock RaceCard: Test Live Race 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock RaceCard: Test Live Race 2'),
    ).toBeInTheDocument();
  });
});
