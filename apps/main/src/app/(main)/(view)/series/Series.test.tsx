import { render, screen } from '@/test-utils';
import React from 'react';
import Series from './Series';
import '@/matchMedia.mock';

// Mock the EventCard component
jest.mock('@/components/cards/EventCard', () => ({
  __esModule: true,
  default: jest.fn(({ event, children }) => (
    <div>
      <div>Mock EventCard: {event.name}</div>
      {children}
    </div>
  )),
}));

const mockData = {
  series: {
    id: 'series-1',
    path: 'organizations/org-1/series/series-1',
    name: 'Test Series',
    location: 'Test Location',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Org',
    },
  },
  children: [
    {
      event: {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event 1',
      },
      children: [],
    },
    {
      event: {
        id: 'event-2',
        path: 'organizations/org-1/series/series-1/events/event-2',
        name: 'Test Event 2',
      },
      children: [],
    },
  ],
};

describe('Series component', () => {
  it('should render series details and event cards', () => {
    render(<Series {...mockData} />);

    // Check for series details
    expect(screen.getByText('Test Series')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();

    // Check for mocked event cards
    expect(
      screen.getByText('Mock EventCard: Test Event 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock EventCard: Test Event 2'),
    ).toBeInTheDocument();
  });
});
