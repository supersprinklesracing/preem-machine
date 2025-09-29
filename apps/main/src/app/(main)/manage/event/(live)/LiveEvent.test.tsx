import { Event } from '@/datastore/schema';
import { render, screen } from '@/test-utils';

import { LiveEvent } from './LiveEvent';

describe('LiveEvent', () => {
  const mockEvent: Pick<
    Event,
    'name' | 'path' | 'seriesBrief' | 'location' | 'startDate' | 'timezone'
  > = {
    name: 'Test Event',
    path: 'organizations/org-1/series/series-1/events/event-1',
    seriesBrief: {
      id: 'series-1',
      path: 'organizations/org-1/series/series-1',
      name: 'Test Series',
      organizationBrief: {
        id: 'org-1',
        path: 'organizations/org-1',
        name: 'Test Org',
      },
    },
    location: 'Test Location',
    startDate: new Date('2025-01-01T12:00:00Z'),
    timezone: 'America/New_York',
  };

  it('should display the timezone', () => {
    render(<LiveEvent event={mockEvent} children={[]} />);
    expect(screen.getByText(/EST/)).toBeInTheDocument();
  });
});
