import { render, screen } from '@/test-utils';
import React from 'react';
import Event from './Event';
import type { EventPageData } from './Event';
import '../../../../matchMedia.mock';

const mockData: EventPageData = {
  event: {
    id: 'event-1',
    name: 'Test Event',
    location: 'Test Location',
    startDate: new Date().toISOString(),
    seriesBrief: { id: 'series-1', name: 'Test Series' },
    races: [
      {
        id: 'race-1',
        name: 'Test Race 1',
        category: 'Pro',
        startDate: new Date().toISOString(),
      },
      {
        id: 'race-2',
        name: 'Test Race 2',
        category: 'Amateur',
        startDate: new Date().toISOString(),
      },
    ],
  },
};

describe('Event component', () => {
  it('should render event details', () => {
    render(<Event data={mockData} />);

    // Check for event details
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Series')).toBeInTheDocument();
  });
});
