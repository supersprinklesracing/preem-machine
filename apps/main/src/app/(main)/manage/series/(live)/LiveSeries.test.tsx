import { Series } from '@/datastore/schema';
import { render, screen } from '@/test-utils';

import { LiveSeries } from './LiveSeries';

describe('LiveSeries', () => {
  const mockSeries: Pick<
    Series,
    | 'name'
    | 'path'
    | 'organizationBrief'
    | 'location'
    | 'startDate'
    | 'endDate'
    | 'timezone'
    | 'description'
    | 'website'
  > = {
    name: 'Test Series',
    path: 'organizations/org-1/series/series-1',
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Org',
    },
    location: 'Test Location',
    startDate: new Date('2025-01-01T12:00:00Z'),
    endDate: new Date('2025-01-05T12:00:00Z'),
    timezone: 'America/New_York',
    description: 'Test Description',
    website: 'https://example.com',
  };

  it('should display the timezone', () => {
    render(<LiveSeries series={mockSeries} children={[]} />);
    expect(screen.getByText(/Jan 1, 2025 - Jan 5, 2025/)).toBeInTheDocument();
  });
});
