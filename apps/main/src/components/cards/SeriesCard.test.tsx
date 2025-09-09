import { Series } from '@/datastore/schema';
import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom';
import SeriesCard from './SeriesCard';

const mockSeries: Series = {
  id: 'series-1',
  path: 'organizations/org-1/series/series-1',
  name: 'Test Series',
  location: 'Test Location',
  startDate: new Date('2024-01-01T00:00:00').toISOString(),
  endDate: new Date('2024-01-31T00:00:00').toISOString(),
  organizationBrief: {
    id: 'org-1',
    path: 'organizations/org-1',
    name: 'Test Org',
  },
};

describe('SeriesCard', () => {
  it('renders series details correctly', () => {
    render(<SeriesCard series={mockSeries} />);

    expect(screen.getByText('Test Series')).toBeInTheDocument();
    expect(screen.getAllByText('Test Location')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Jan 1, 2024/i)[0]).toBeInTheDocument();
  });
});
