import React from 'react';

import { render, screen } from '@/test-utils';

import { Series } from './Series';

// Mock the EventCard component
jest.mock('@/components/cards/EventCard', () => ({
  __esModule: true,
  EventCard: jest.fn(({ event, children }) => (
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
    description: 'This is a test series.',
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    timezone: 'America/Los_Angeles',
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
    expect(screen.getByText('This is a test series.')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();

    // Check for mocked event cards
    expect(
      screen.getByText('Mock EventCard: Test Event 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock EventCard: Test Event 2'),
    ).toBeInTheDocument();
  });

  it('should display the timezone', () => {
    render(<Series {...mockData} />);
    expect(screen.getByText(/PDT/)).toBeInTheDocument();
  });
});
