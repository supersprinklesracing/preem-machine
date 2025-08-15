import { render, screen } from '../test-utils';
import '@testing-library/jest-dom';
import SeriesCard from './SeriesCard';
import { raceSeries } from '../datastore/mock-data';
import { format } from 'date-fns';

const mockSeries = raceSeries[0];

describe('SeriesCard', () => {
  it('should render the series name', () => {
    render(<SeriesCard series={mockSeries} />);
    expect(screen.getByText(mockSeries.name)).toBeInTheDocument();
  });

  it('should render the series region', () => {
    render(<SeriesCard series={mockSeries} />);
    expect(screen.getByText(mockSeries.region)).toBeInTheDocument();
  });

  it('should render the series date range', () => {
    render(<SeriesCard series={mockSeries} />);
    const expectedDate = `${format(
      new Date(mockSeries.startDate),
      'PP'
    )} - ${format(new Date(mockSeries.endDate), 'PP')}`;
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });
});
