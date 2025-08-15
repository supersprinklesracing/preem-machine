import { render, screen } from '../test-utils';
import '@testing-library/jest-dom';
import EventCard from './EventCard';
import { raceSeries } from '../datastore/mock-data';
import { format } from 'date-fns';
import { EnrichedEvent } from '../datastore/data-access';

const mockEnrichedEvent: EnrichedEvent = {
  ...raceSeries[0].events[0],
  totalCollected: 1234,
  totalContributors: 56,
};

describe('EventCard', () => {
  it('should render the event name', () => {
    render(<EventCard event={mockEnrichedEvent} />);
    expect(screen.getByText(mockEnrichedEvent.name)).toBeInTheDocument();
  });

  it('should render the event date', () => {
    render(<EventCard event={mockEnrichedEvent} />);
    const expectedDate = format(new Date(mockEnrichedEvent.dateTime), 'PP');
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('should render the total prize pool', () => {
    render(<EventCard event={mockEnrichedEvent} />);
    expect(
      screen.getByText(`$${mockEnrichedEvent.totalCollected.toLocaleString()}`)
    ).toBeInTheDocument();
  });

  it('should render the total contributors', () => {
    render(<EventCard event={mockEnrichedEvent} />);
    expect(
      screen.getByText(`${mockEnrichedEvent.totalContributors} Contributors`)
    ).toBeInTheDocument();
  });
});
